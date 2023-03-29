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

// SDE-IMPL-REQUIRED 本ファイルをコピーして外部サービスに公開する REST API インタフェースを定義します。
import {
    JsonController, Get, Post, Delete, Body, Header, Req, UseBefore
} from 'routing-controllers';
/* eslint-disable */
import { Request } from 'express';
import PostCertificateManageReqDto from './dto/PostCertificateManageReqDto';
/* eslint-enable */
import PostCertificateManageResDto from './dto/PostCertificateManageResDto';
import OperatorService from '../services/OperatorService';
import CertificateManageService from '../services/CertificateManageService';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import PostCertificateManageRequestValidator from './validator/PostCertificateManageRequestValidator';
import EntityOperation from '../repositories/EntityOperation';
import { transformAndValidate } from 'class-transformer-validator';
import RevokeCertificateReqDto from './dto/RevokeCertificateReqDto';
import Config from '../common/Config';

@JsonController('/certificate-manage')
export default class CertificateManageController {
    // 設定ファイル読込
    private readonly configure = Config.ReadConfig('./config/config.json');

    @Post()
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(PostCertificateManageRequestValidator)
    async postCertificateManage (@Req() req: Request, @Body() dto: PostCertificateManageReqDto) {
        // セッションからオペレーター情報を取得する
        const operator = await OperatorService.authMe(req);

        // 認証局管理サービスを実行
        const certManageService: CertificateManageService = new CertificateManageService();
        const certificateManageEntity = await certManageService.saveCertificate(dto, operator, this.configure);

        // 証明書情報を証明書管理に登録する
        await EntityOperation.saveEntity(certificateManageEntity);

        // 取得した証明書情報を返す レスポンスを生成して終了
        const postCertificateManageResDto = new PostCertificateManageResDto();
        const ret = postCertificateManageResDto.parseEntity(certificateManageEntity);
        return ret;
    }

    @Get('/check/client')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async checkClientCertificate (@Req() req: Request) {
        // セッションからオペレーター情報を取得する
        await OperatorService.authMe(req);

        // 検索を実行
        const certManageService: CertificateManageService = new CertificateManageService();
        const ret = await certManageService.checkClientCertificate();
        return ret;
    }

    @Delete('/:serialNo/:fingerPrint')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async revokeCertificate (@Req() req: Request) {
        const dto = await transformAndValidate(
            RevokeCertificateReqDto, req.params
        ) as RevokeCertificateReqDto;

        // セッションからオペレーター情報を取得する
        const operator = await OperatorService.authMe(req);

        // 失効を実行
        const certManageService: CertificateManageService = new CertificateManageService();
        const ret = await certManageService.revokeCertificate(dto, operator, this.configure);
        return ret;
    }
}
