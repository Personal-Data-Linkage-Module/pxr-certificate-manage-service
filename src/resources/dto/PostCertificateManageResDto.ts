/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import CertificateManage from '../../repositories/postgres/CertificateManage';
import { DateTimeFormatString } from '../../common/Transform';
/* eslint-enable */
import Config from '../../common/Config';
import moment = require('moment-timezone');
const config = Config.ReadConfig('./config/config.json');

/**
 * POST: 証明書管理サービスのレスポンスDTO
 */
export default class PostCertificateManageResDto {
    /**
     * 登録した証明書情報の内容からレスポンスを生成する
     * @param entity エンティティ
     */
    public parseEntity (entity: CertificateManage): any {
        let block: any = null;
        let actor: any = null;
        if ((entity.blockCode) || (entity.blockVersion)) {
            block = {
                value: entity.blockCode,
                ver: entity.blockVersion
            };
        }
        if ((entity.actorCode) || (entity.actorVersion)) {
            actor = {
                value: entity.actorCode,
                ver: entity.actorVersion
            };
        }
        const ret: any = {
            certType: entity.certType,
            subject: JSON.parse(entity.subject),
            serialNo: entity.serialNo,
            fingerPrint: entity.fingerPrint,
            validPeriodStart: moment(entity.validPeriodStart).tz(config['timezone']).format(DateTimeFormatString),
            validPeriodEnd: moment(entity.validPeriodEnd).tz(config['timezone']).format(DateTimeFormatString),
            block: block,
            actor: actor
        };
        return ret;
    }
}
