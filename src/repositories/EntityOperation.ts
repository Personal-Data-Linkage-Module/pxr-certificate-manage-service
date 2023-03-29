/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import AppError from '../common/AppError';
import { connectDatabase } from '../common/Connection';
import { BaseEntity, UpdateResult } from 'typeorm';
import Config from '../common/Config';
import CertificateManage from './postgres/CertificateManage';
const Message = Config.ReadConfig('./config/message.json');
/* eslint-enable */

/**
 * 各エンティティ操作クラス
 */
export default class EntityOperation {
    /** 日付のフォーマット（データベース用） */
    static readonly DATE_TIME_FORMAT_DATABASE = 'YYYY-MM-DD HH:mm:ss.SSS';

    /**
     * エンティティの登録|更新（共通）
     * @param entity
     */
    static async saveEntity<T extends BaseEntity> (entity: T): Promise<T> {
        const connection = await connectDatabase();
        const queryRunner = connection.createQueryRunner();
        try {
            await queryRunner.startTransaction();
            const ret = await queryRunner.manager.save(entity);
            await queryRunner.commitTransaction();
            return ret;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new AppError(Message.FAILED_SAVE_ENTITY, 500, err);
        } finally {
            await queryRunner.release();
            // await connection.close();
        }
    }

    /**
     * クライアント証明書件数取得
     */
    static async countClientCertificate (): Promise<number> {
        // SQLを生成及び実行
        const connection = await connectDatabase();
        const ret = await connection
            .createQueryBuilder()
            .from(CertificateManage, 'certificate_manage')
            .where('certificate_manage.cert_type = :cert_type', { cert_type: 'client' })
            .andWhere('certificate_manage.is_disabled = :is_disabled', { is_disabled: false })
            .getCount();
        return ret;
    }

    /**
     * 証明書管理レコード取得
     * @param serialNo
     * @param fingerPrint
     */
    static async getRecord (serialNo: string, fingerPrint: string): Promise<CertificateManage> {
        // SQLを生成及び実行
        const connection = await connectDatabase();
        const ret = await connection
            .createQueryBuilder()
            .from(CertificateManage, 'certificate_manage')
            .where('certificate_manage.is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('certificate_manage.serial_no = :serial_no', { serial_no: serialNo })
            .andWhere('certificate_manage.finger_print = :finger_print', { finger_print: fingerPrint })
            .getRawOne();
        return ret ? new CertificateManage(ret) : null;
    }

    /**
     * 証明書管理レコード削除
     * @param entity
     */
    static async deleteRecord (entity: CertificateManage): Promise<UpdateResult> {
        // SQLを生成及び実行
        const connection = await connectDatabase();
        const ret = await connection
            .createQueryBuilder()
            .update(CertificateManage)
            .set({
                isDisabled: true,
                updatedBy: entity.updatedBy
            })
            .where('certificate_manage.is_disabled = :is_disabled', { is_disabled: false })
            .andWhere('certificate_manage.serial_no = :serial_no', { serial_no: entity.serialNo })
            .andWhere('certificate_manage.finger_print = :finger_print', { finger_print: entity.fingerPrint })
            .execute();
        return ret;
    }
}
