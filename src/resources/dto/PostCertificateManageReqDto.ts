/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import {
    IsString,
    IsDefined,
    IsNotEmpty,
    IsIn
} from 'class-validator';

/**
 * POST: 証明書管理サービスのリクエストDTO
 */
export default class PostCertificateManageReqDto {
    /** 証明書タイプ */
    @IsString()
    @IsDefined()
    @IsIn(['root', 'server', 'client'])
    certType: string;

    /** シリアル番号 */
    @IsString()
    @IsDefined()
    @IsNotEmpty()
    serialNo: string;

    /** フィンガープリント */
    @IsString()
    @IsDefined()
    @IsNotEmpty()
    fingerPrint: string;

    /** 証明書 */
    @IsString()
    @IsDefined()
    @IsNotEmpty()
    certificate: string;
}
