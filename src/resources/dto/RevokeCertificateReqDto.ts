/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import {
    IsString,
    IsDefined,
    IsNotEmpty
} from 'class-validator';

/**
 * DELETE: 証明書失効のリクエストDTO
 */
export default class RevokeCertificateReqDto {
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
}
