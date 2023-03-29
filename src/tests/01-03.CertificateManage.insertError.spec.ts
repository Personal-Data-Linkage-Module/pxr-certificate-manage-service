/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import Application from '../index';
import { Url } from './Common';
import { Session } from './Session';
import StubCertificationAuthorityServer from './StubCertificationAuthorityServer';
import { sprintf } from 'sprintf-js';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

// テストモジュールをインポート
jest.mock('../repositories/EntityOperation');

// 対象アプリケーションを取得
const expressApp = Application.express.app;

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
    });
    /**
     * 各テスト実行の前処理
     */
    beforeEach(async () => {
    });
    /**
     * 全テスト実行の後処理
     */
    afterAll(async () => {
        // サーバ停止
        await Application.stop();

        // モック解除
        jest.deepUnmock('../repositories/EntityOperation');
    });
    /**
     * 各テスト実行の後処理
     */
    afterEach(async () => {
        // スタブサーバー停止
        if (_certAuthServer) {
            _certAuthServer._server.close();
            _certAuthServer = null;
        }
    });

    /**
     * 証明書保存
     */
    describe('証明書保存', () => {
        test('異常：DBインサートエラー', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('root', 200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    serialNo: 'XXXXXXXX',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            const description = '証明書保存';
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(sprintf(Message.RESPONSE_FAIL, description));
        });
    });
});
