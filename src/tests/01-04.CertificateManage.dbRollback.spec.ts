/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import Application from '../index';
import Common, { Url } from './Common';
import { StubOperatorServer0 } from './StubOperatorServer';
import StubCertificationAuthorityServer from './StubCertificationAuthorityServer';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

// 対象アプリケーションを取得
const expressApp = Application.express.app;
const common = new Common();

// スタブサーバー（オペレータサービス）
let _operatorServer: StubOperatorServer0 = null;

// スタブサーバー (認証局サービス)
let _certAuthServer: StubCertificationAuthorityServer = null;

/**
 * certificate-manage API のユニットテスト
 */
describe('certificate-manage API', () => {
    /**
     * 全テスト実行の前処理
     */
    beforeAll(async () => {
        await Application.start();
        // DB初期化
        await common.executeSqlFile('initialData.sql');
    });
    /**
     * 全テスト実行の後処理
     */
    afterAll(async () => {
        // サーバ停止
        await Application.stop();
    });
    /**
     * 各テスト実行の後処理
     */
    afterEach(async () => {
        // スタブサーバー停止
        if (_operatorServer) {
            _operatorServer._server.close();
            _operatorServer = null;
        }
        if (_certAuthServer) {
            _certAuthServer._server.close();
            _certAuthServer = null;
        }
    });

    /**
     * 証明書保存
     */
    describe('証明書保存', () => {
        test('異常：DBインサートロールバック', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);

            // スタブサーバー起動 DB登録時loginIdがないためnull違反が発生する
            _operatorServer = new StubOperatorServer0(200, 0);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    certType: 'client',
                    serialNo: 'XXXXXXXX',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_SAVE_ENTITY);
        });
    });
});
