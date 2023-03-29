/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 *
 *
 *
 * $Date$
 * $Revision$
 * $Author$
 *
 * TEMPLATE VERSION :  76463
 */
/* eslint-disable */
import OperatorDomain from '../domains/OperatorDomain';
import PostCertificateManageReqDto from '../resources/dto/PostCertificateManageReqDto';
import RevokeCertificateReqDto from '../resources/dto/RevokeCertificateReqDto';
/* eslint-enable */
import CertificateManageServiceDto from './dto/CertificateManageServiceDto';
import CertificateManage from '../repositories/postgres/CertificateManage';
import EntityOperation from '../repositories/EntityOperation';
import AppError from '../common/AppError';
import { doGetRequest } from '../common/DoRequest';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');
const Configure = Config.ReadConfig('./config/config.json');
import urljoin = require('url-join');

// @Service()
export default class CertificateManageService {
    /**
     * リクエストされた内容から、証明書情報を登録して返却する
     * @param dto
     * @param operator
     * @param configure
     */
    public async saveCertificate (dto: PostCertificateManageReqDto, operator:OperatorDomain, configure:any) {
        // 認証局サービスで対象証明書が存在するか確認する
        const certManageDto = new CertificateManageServiceDto();
        certManageDto.setOperator(operator);
        certManageDto.setCertificationAuthorityUrl(configure['certificationAuthorityUrl']);
        certManageDto.setCertType(dto.certType);
        certManageDto.setSerialNo(dto.serialNo);
        certManageDto.setFingerPrint(dto.fingerPrint);
        certManageDto.setCertificate(dto.certificate);
        const certificate = await this.getCertificateInfo(certManageDto);
        if (!certificate) {
            // エラーを返す
            throw new AppError(Message.TARGET_NO_DATA, 404);
        }

        // 保存証明書が異なる場合
        const regex1 = /\\r\\n/g;
        const certificateVal1 = certificate['certificate'].replace(regex1, '\r\n');
        if (certificateVal1 !== certManageDto.getCertificate()) {
            // エラーを返す
            throw new AppError(Message.DIFF_CERTIFICATE, 400);
        }

        // 認証局サービスからアクター情報、ブロック情報を取得する
        const actor = await this.getActorInfo(certManageDto);
        if (!actor) {
            // エラーを返す
            throw new AppError(Message.TARGET_NO_DATA, 404);
        }

        // 登録、返却用証明書管理テーブルデータを生成
        const certificateManageEntity = new CertificateManage();
        certificateManageEntity.certType = certificate['certType'];
        certificateManageEntity.subject = JSON.stringify(certificate['subject']);
        certificateManageEntity.serialNo = certificate['serialNo'];
        certificateManageEntity.fingerPrint = certManageDto.getFingerPrint();
        certificateManageEntity.validPeriodStart = certificate['validPeriodStart'];
        certificateManageEntity.validPeriodEnd = certificate['validPeriodEnd'];
        certificateManageEntity.certificate = certificate['certificate'];
        certificateManageEntity.actorCode = actor['actor'] ? actor['actor']['value'] : null;
        certificateManageEntity.actorVersion = actor['actor'] ? actor['actor']['ver'] : null;
        certificateManageEntity.blockCode = actor['block'] ? actor['block']['value'] : null;
        certificateManageEntity.blockVersion = actor['block'] ? actor['block']['ver'] : null;
        certificateManageEntity.isDistributed = false;
        certificateManageEntity.isDisabled = false;
        certificateManageEntity.createdBy = operator.loginId;
        certificateManageEntity.updatedBy = operator.loginId;
        return certificateManageEntity;
    }

    /**
     * クライアント証明書が登録されているか確認する
     */
    public async checkClientCertificate () {
        // シリアル番号とフィンガープリントでレコードを取得
        const count: number = await EntityOperation.countClientCertificate();
        if (count < 1) {
            throw new AppError(Message.TARGET_NO_DATA, 400);
        }
        return {
            isExist: true
        };
    }

    /**
     * 証明書を失効する
     * @param dto
     * @param operator
     * @param configure
     */
    public async revokeCertificate (dto: RevokeCertificateReqDto, operator: OperatorDomain, configure: any) {
        // シリアル番号とフィンガープリントでレコードを取得
        const entity: CertificateManage = await EntityOperation.getRecord(dto.serialNo, dto.fingerPrint);
        if (!entity) {
            throw new AppError(Message.TARGET_NO_DATA, 400);
        }

        // 認証局から対象証明書を取得する
        const certManageDto = new CertificateManageServiceDto();
        certManageDto.setOperator(operator);
        certManageDto.setCertificationAuthorityUrl(configure['certificationAuthorityUrl']);
        certManageDto.setCertType(entity.certType);
        certManageDto.setSerialNo(entity.serialNo);
        certManageDto.setFingerPrint(entity.fingerPrint);
        const cert = await this.getCertificateInfo(certManageDto);

        // 証明書が異なる場合エラー
        const regex1 = /\\r\\n/g;
        const certificate = cert['certificate'].replace(regex1, '\r\n');
        if (certificate !== entity.certificate) {
            throw new AppError(Message.DIFF_CERTIFICATE, 400);
        }

        // 対象レコードを削除
        entity.updatedBy = operator.loginId;
        await EntityOperation.deleteRecord(entity);

        return {
            result: 'success'
        };
    }

    /**
     * 認証局サービスから証明書情報を取得
     * @param certManageDto
     */
    private async getCertificateInfo (certManageDto: CertificateManageServiceDto): Promise<string> {
        try {
            let url: string = null;
            // URLを生成
            if (certManageDto.getCertType() === 'root') {
                url = urljoin(certManageDto.getCertificationAuthorityUrl(), certManageDto.getCertType());
            } else {
                url = urljoin(certManageDto.getCertificationAuthorityUrl(), certManageDto.getCertType(), certManageDto.getSerialNo(), certManageDto.getFingerPrint());
            }
            if (!Configure['pxr-root-block']) {
                url = url + '&from_path=/certificate-manage';
            }

            // 認証局サービスから証明書情報取得を呼び出す
            const options = {
                headers: {
                    accept: 'application/json',
                    session: certManageDto.getOperator().encoded
                }
            };
            const result = await doGetRequest(url, options);

            // レスポンスコードが200以外の場合
            // ステータスコードを判定
            const statusCode: string = result.response.statusCode.toString();
            if (result.response.statusCode === 400) {
                // 応答が400の場合、エラーを返す
                throw new AppError(Message.FAILED_CERTIFICATION_AUTORITY_CERT_GET, 400);
            } else if (statusCode.match(/^5.+/)) {
                // 応答が500系の場合、エラーを返す
                throw new AppError(Message.FAILED_CERTIFICATION_AUTORITY_CERT_GET, 503);
            } else if (result.response.statusCode !== 200 &&
                        result.response.statusCode !== 404) {
                // 応答が200以外の場合、エラーを返す
                throw new AppError(Message.FAILED_CERTIFICATION_AUTORITY_CERT_GET, 400);
            }
            // 証明書情報を戻す
            return result.response.statusCode === 200 ? JSON.parse(result.body) : null;
        } catch (err) {
            if (err.name === AppError.NAME) {
                throw err;
            }
            // サービスへの接続に失敗した場合
            throw new AppError(Message.FAILED_CONNECT_TO_CERTIFICATION_AUTORITY, 503, err);
        }
    }

    /**
     * 認証局サービスからアクター情報を取得
     * @param certManageDto
     */
    private async getActorInfo (certManageDto: CertificateManageServiceDto): Promise<string> {
        try {
            // URLを生成
            let url: string = urljoin(certManageDto.getCertificationAuthorityUrl(), 'actor', certManageDto.getSerialNo(), certManageDto.getFingerPrint());
            if (!Configure['pxr-root-block']) {
                url = url + '&from_path=/certificate-manage';
            }

            // 認証局サービスからアクター情報取得を呼び出す
            const options = {
                headers: {
                    accept: 'application/json',
                    session: certManageDto.getOperator().encoded
                }
            };
            const result = await doGetRequest(url, options);

            // レスポンスコードが200以外の場合
            // ステータスコードを判定
            const statusCode: string = result.response.statusCode.toString();
            if (result.response.statusCode === 400) {
                // 応答が400の場合、エラーを返す
                throw new AppError(Message.FAILED_CERTIFICATION_AUTORITY_ACTOR_GET, 400);
            } else if (statusCode.match(/^5.+/)) {
                // 応答が500系の場合、エラーを返す
                throw new AppError(Message.FAILED_CERTIFICATION_AUTORITY_ACTOR_GET, 503);
            } else if (result.response.statusCode !== 200 &&
                        result.response.statusCode !== 404) {
                // 応答が200以外の場合、エラーを返す
                throw new AppError(Message.FAILED_CERTIFICATION_AUTORITY_ACTOR_GET, 400);
            }
            // 証明書情報を戻す
            return result.response.statusCode === 200 ? JSON.parse(result.body) : null;
        } catch (err) {
            if (err.name === AppError.NAME) {
                throw err;
            }
            // サービスへの接続に失敗した場合
            throw new AppError(Message.FAILED_CONNECT_TO_CERTIFICATION_AUTORITY, 503, err);
        }
    }
}
