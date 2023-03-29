/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import Operator from '../../domains/OperatorDomain';
/* eslint-enable */

/**
 * サーバ証明書サービスデータ
 */
export default class CertificateManageDto {
    /**
     * オペレータ情報
     */
    private operator: Operator = null;

    /**
     * 認証局URL
     */
    private certificationAuthorityUrl: string = null;

    /**
     * 証明書タイプ
     */
    private certType: string = null;

    /**
     * シリアル番号
     */
    private serialNo: string = null;

    /**
     * フィンガープリント
     */
    private fingerPrint: string = null;

    /**
     * 証明書
     */
    private certificate: string = null;

    /**
     * オペレータ情報取得
     */
    public getOperator (): Operator {
        return this.operator;
    }

    /**
     * オペレータ情報設定
     * @param operator
     */
    public setOperator (operator: Operator) {
        this.operator = operator;
    }

    /**
     * 認証局URL取得
     */
    public getCertificationAuthorityUrl (): string {
        return this.certificationAuthorityUrl;
    }

    /**
     * 認証局URL設定
     * @param certificationAuthorityUrl
     */
    public setCertificationAuthorityUrl (certificationAuthorityUrl: string) {
        this.certificationAuthorityUrl = certificationAuthorityUrl;
    }

    /**
     * 証明書タイプ取得
     */
    public getCertType (): string {
        return this.certType;
    }

    /**
     * 証明書タイプ設定
     * @param certType
     */
    public setCertType (certType: string) {
        this.certType = certType;
    }

    /**
     * シリアル番号取得
     */
    public getSerialNo (): string {
        return this.serialNo;
    }

    /**
     * シリアル番号設定
     * @param serialNo
     */
    public setSerialNo (serialNo: string) {
        this.serialNo = serialNo;
    }

    /**
     * フィンガープリント取得
     */
    public getFingerPrint (): string {
        return this.fingerPrint;
    }

    /**
     * フィンガープリント設定
     * @param fingerPrint
     */
    public setFingerPrint (fingerPrint: string) {
        this.fingerPrint = fingerPrint;
    }

    /**
     * 証明書取得
     */
    public getCertificate (): string {
        return this.certificate;
    }

    /**
     * 証明書設定
     * @param certificate
     */
    public setCertificate (certificate: string) {
        this.certificate = certificate;
    }
}
