/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
/* eslint-enable */

/**
 * 証明書管理テーブル エンティティクラス
 */
@Entity('certificate_manage')
export default class CertificateManage extends BaseEntity {
    /** ID */
    @PrimaryGeneratedColumn({ type: 'bigint' })
    readonly id!: number;

    /** 証明書タイプ */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'cert_type' })
    certType: string = '';

    /** サブジェクト */
    @Column({ type: 'text', nullable: false, name: 'subject' })
    subject: string = '';

    /** シリアル番号 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'serial_no' })
    serialNo: string = '';

    /** フィンガープリント */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'finger_print' })
    fingerPrint: string = '';

    /** 有効期間開始 */
    @Column({ type: 'timestamp without time zone', name: 'valid_period_start' })
    validPeriodStart: Date = new Date();

    /** 有効期間終了 */
    @Column({ type: 'timestamp without time zone', name: 'valid_period_end' })
    validPeriodEnd: Date = new Date();

    /** 証明書(PEM) */
    @Column({ type: 'text', nullable: false, name: 'certificate' })
    certificate: string = '';

    /** アクターカタログコード */
    @Column({ type: 'bigint', name: 'actor_code' })
    actorCode: number = 0;

    /** アクターカタログバージョン */
    @Column({ type: 'bigint', name: 'actor_version' })
    actorVersion: number = 0;

    /** ブロックコード */
    @Column({ type: 'bigint', name: 'block_code' })
    blockCode: number = 0;

    /** ブロックバージョン */
    @Column({ type: 'bigint', name: 'block_version' })
    blockVersion: number = 0;

    /** 配布フラグ */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'is_distributed' })
    isDistributed: boolean = false;

    /** 削除フラグ */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'is_disabled' })
    isDisabled: boolean = false;

    /** 登録者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'created_by' })
    createdBy: string = '';

    /** 登録日時 */
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: false, name: 'created_at' })
    readonly createdAt!: Date;

    /** 更新者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'updated_by' })
    updatedBy: string = '';

    /** 更新日時 */
    @UpdateDateColumn({ type: 'timestamp without time zone', name: 'updated_at', onUpdate: 'now()' })
    readonly updatedAt!: Date;

    /**
     * コンストラクタ
     * @param entity
     */
    constructor (entity?: {}) {
        super();
        if (entity) {
            this.id = Number(entity['id']);
            this.certType = entity['cert_type'];
            this.subject = entity['subject'];
            this.serialNo = entity['serial_no'];
            this.fingerPrint = entity['finger_print'];
            this.validPeriodStart = new Date(entity['valid_period_start']);
            this.validPeriodEnd = new Date(entity['valid_period_end']);
            this.certificate = entity['certificate'];
            this.actorCode = Number(entity['actor_code']);
            this.actorVersion = Number(entity['actor_version']);
            this.blockCode = Number(entity['block_code']);
            this.blockVersion = Number(entity['block_version']);
            this.isDistributed = Boolean(entity['is_distributed']);
            this.isDisabled = Boolean(entity['is_disabled']);
            this.createdBy = entity['created_by'];
            this.createdAt = new Date(entity['created_at']);
            this.updatedBy = entity['updated_by'];
            this.updatedAt = new Date(entity['updated_at']);
        }
    }
}
