/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import { sprintf } from 'sprintf-js';
import AppError from '../../common/AppError';
import Config from '../../common/Config';
const Message = Config.ReadConfig('./config/message.json');
/* eslint-disable */
import { BaseEntity } from 'typeorm';
/* eslint-enable */

/**
 * 各エンティティ操作クラス
 */
export default class EntityOperation {
    /**
     * エンティティの登録|更新（共通）
     * @param entity
     */
    static async saveEntity<T extends BaseEntity> (entity: T): Promise<T> {
        const description = '証明書保存';
        throw new AppError(sprintf(Message.RESPONSE_FAIL, description), 503);
    }
}
