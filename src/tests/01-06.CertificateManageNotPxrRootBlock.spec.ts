/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import Application from '../index';
import Common, { Url } from './Common';
import { Session } from './Session';
import StubOperatorServer from './StubOperatorServer';
import StubCertificationAuthorityServer from './StubCertificationAuthorityServer';

// 対象アプリケーションを取得
const expressApp = Application.express.app;
const common = new Common();

// スタブサーバー（オペレータサービス）
let _operatorServer: StubOperatorServer = null;

// スタブサーバー (認証局サービス)
let _certAuthServer: StubCertificationAuthorityServer = null;

jest.mock('../common/Config', () => ({
    ...jest.requireActual('../common/Config') as any,
    default: {
        ReadConfig: jest.fn((path: string) => {
            const fs = require('fs');
            if (path === './config/config.json') {
                return {
                    operatorUrl: 'http://localhost:3000/operator',
                    operatorServiceSession: 'http://localhost:3000/operator/session/',
                    certificationAuthorityUrl: 'http://localhost:3012/certification-authority',
                    timezone: 'Asia/Tokyo',
                    'pxr-root-block': false
                };
            } else {
                return JSON.parse(fs.readFileSync(path, 'UTF-8'));
            }
        })
    }
}));

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
        test('正常：ルート証明書保存', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('root', 200);

            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'root',
                    serialNo: 'XXXXXXXX',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('root');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe('JP');
            expect(response.body.subject.ST).toBe('Tokyo');
            expect(response.body.subject.L).toBe('Minato-ku');
            expect(response.body.subject.O).toBe('aaa Corporation');
            expect(response.body.subject.OU).toBe('PXR');
            expect(response.body.subject.CN).toBe('*.---.co.jp');
            expect(response.body.serialNo).toBe('XXXXXXXX');
            expect(response.body.fingerPrint).toBe('XX:XX:XX:XX:XX:XX:XX:XX');
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.block).toBeNull();
            expect(response.body.actor).toBeNull();
        });
        test('正常：サーバ証明書保存', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('server', 200);

            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'server',
                    serialNo: 'XXXXXXXX',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('server');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe('JP');
            expect(response.body.subject.ST).toBe('Tokyo');
            expect(response.body.subject.L).toBe('Minato-ku');
            expect(response.body.subject.O).toBe('test-org');
            expect(response.body.subject.OU).toBe('test-unit');
            expect(response.body.subject.CN).toBe('*.---.co.jp');
            expect(response.body.serialNo).toBe('XXXXXXXX');
            expect(response.body.fingerPrint).toBe('XX:XX:XX:XX:XX:XX:XX:XX');
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.block).not.toBeNull();
            expect(response.body.block.value).toBe(10001);
            expect(response.body.block.ver).toBe(1);
            expect(response.body.actor).not.toBeNull();
            expect(response.body.actor.value).toBe(10002);
            expect(response.body.actor.ver).toBe(2);
        });
        test('正常：クライアント証明書保存', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);

            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

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
            expect(response.status).toBe(200);
            expect(response.body.certType).toBe('client');
            expect(response.body.subject).not.toBeNull();
            expect(response.body.subject.C).toBe('JP');
            expect(response.body.subject.ST).toBe('Tokyo');
            expect(response.body.subject.L).toBe('Minato-ku');
            expect(response.body.subject.O).toBe('test-org');
            expect(response.body.subject.OU).toBe('test-unit');
            expect(response.body.subject.CN).toBe('*.---.co.jp');
            expect(response.body.serialNo).toBe('XXXXXXXX');
            expect(response.body.fingerPrint).toBe('XX:XX:XX:XX:XX:XX:XX:XX');
            expect(response.body.validPeriodStart).not.toBeNull();
            expect(response.body.validPeriodEnd).not.toBeNull();
            expect(response.body.block.value).toBe(10001);
            expect(response.body.block.ver).toBe(1);
            expect(response.body.actor).not.toBeNull();
            expect(response.body.actor.value).toBe(10002);
            expect(response.body.actor.ver).toBe(2);
        });
    });
});
