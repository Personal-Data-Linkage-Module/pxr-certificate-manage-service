/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import Application from '../index';
import Common, { Url } from './Common';
import { Session } from './Session';
import StubOperatorServer, { StubOperatorServer1 } from './StubOperatorServer';
import StubCertificationAuthorityServer from './StubCertificationAuthorityServer';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

// 対象アプリケーションを取得
const expressApp = Application.express.app;
const common = new Common();

// スタブサーバー（オペレータサービス）
let _operatorServer: StubOperatorServer = null;

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
        test('正常：Cookie使用, 個人', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);

            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

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
        test('正常：Cookie使用, 個人, block,actorなし', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);

            // スタブサーバー起動
            _operatorServer = new StubOperatorServer1(200);

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
        test('正常：Cookie使用, アプリケーション', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);

            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
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
        test('正常：Cookie使用, 運営メンバー', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);

            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
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
        test('異常：Cookie使用, オペレータサービス未起動', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    certType: 'client',
                    serialNo: 'XXXXXXXX',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_OPERATOR);
        });
        test('異常：Cookie使用, オペレータサービス応答400系', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);

            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(400);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    certType: 'client',
                    serialNo: 'XXXXXXXX',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_OPERATOR);
        });
        test('異常：Cookie使用, オペレータサービス応答500系', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);

            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(500);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    certType: 'client',
                    serialNo: 'XXXXXXXX',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_OPERATOR);
        });
        /*
        test('異常：アクター情報登録APIが存在しない', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);

            // スタブサーバー起動
            _operatorServer = new StubOperatorServer2(200);

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
            expect(JSON.stringify(response.body)).toBe(JSON.stringify(
                { status: 500, message: 'オペレーターサービスへの接続に失敗しました' }
            ));
            expect(response.status).toBe(500);
        });
        test('異常：アクター情報保存に失敗', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);

            // スタブサーバー起動
            _operatorServer = new StubOperatorServer3(500);

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
            expect(JSON.stringify(response.body)).toBe(JSON.stringify(
                { status: 500, message: 'オペレーターサービスへのアクター情報の登録に失敗しました' }
            ));
            expect(response.status).toBe(500);
        });
        */
        test('異常：認証局サービス未起動', async () => {
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
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_CERTIFICATION_AUTORITY);
        });
        test('異常：認証局サービス応答200系', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 204);
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
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.FAILED_CERTIFICATION_AUTORITY_CERT_GET);
        });
        test('異常：認証局サービス応答400系', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 400);
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
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.FAILED_CERTIFICATION_AUTORITY_CERT_GET);
        });
        test('異常：認証局サービス応答500系', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 500);
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
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_CERTIFICATION_AUTORITY_CERT_GET);
        });
        test('異常：アクター認証局サービス未起動', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('actor', 0);
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
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_CERTIFICATION_AUTORITY);
        });
        test('異常：アクター認証局サービス応答200系', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('actor', 204);
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
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.FAILED_CERTIFICATION_AUTORITY_ACTOR_GET);
        });
        test('異常：アクター認証局サービス応答400系', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('actor', 400);
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
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.FAILED_CERTIFICATION_AUTORITY_ACTOR_GET);
        });
        test('異常：アクター認証局サービス応答500系', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('actor', 500);
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
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_CERTIFICATION_AUTORITY_ACTOR_GET);
        });
        test('異常：セッションなし', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    certType: 'client',
                    serialNo: 'XXXXXXXX',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常：存在しない証明書を指定', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 404);
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    serialNo: 'XXXXXXXXYYY',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XXYYY',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(404);
            expect(response.body.message).toBe(Message.TARGET_NO_DATA);
        });
        test('異常：存在しないアクター', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('actor', 404);
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
            expect(response.status).toBe(404);
            expect(response.body.message).toBe(Message.TARGET_NO_DATA);
        });
        test('異常：異なる証明書を使用', async () => {
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
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIArAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.DIFF_CERTIFICATE);
        });
        test('パラメータ不足：すべて空', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_IS_EMPTY);
        });
        test('異常：リクエストが配列', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('root', 200);
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send([{
                    certType: 'root',
                    serialNo: 'XXXXXXXX',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                }]);

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.UNEXPECTED_ARRAY_REQUEST);
        });
        test('パラメータ不足：certType', async () => {
            // スタブサーバー起動
            _certAuthServer = new StubCertificationAuthorityServer('client', 200);
            // スタブサーバー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    serialNo: 'XXXXXXXX',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.reasons[0].message).toBe(Message.validation.isDefined);
        });
        test('パラメータ不足：serialNo', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.reasons[0].message).toBe(Message.validation.isDefined);
        });
        test('パラメータ不足：fingerPrint', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    serialNo: 'XXXXXXXX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.reasons[0].message).toBe(Message.validation.isDefined);
        });
        test('パラメータ不足：certificate', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    serialNo: 'XXXXXXXX',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.reasons[0].message).toBe(Message.validation.isDefined);
        });
        test('パラメータ異常：certType', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: '',
                    serialNo: 'XXXXXXXX',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.reasons[0].message).toBe(Message.validation.isIn);
        });
        test('パラメータ異常：serialNo', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    serialNo: '',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.reasons[0].message).toBe(Message.validation.isNotEmpty);
        });
        test('パラメータ異常：fingerPrint', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    serialNo: 'XXXXXXXX',
                    fingerPrint: '',
                    certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.reasons[0].message).toBe(Message.validation.isNotEmpty);
        });
        test('パラメータ異常：certificate', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    certType: 'client',
                    serialNo: 'XXXXXXXX',
                    fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                    certificate: ''
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.reasons[0].message).toBe(Message.validation.isNotEmpty);
        });
    });
});
