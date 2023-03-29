/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import supertest = require('supertest');
import Application from '../index';
import Common from './Common';
import StubCertificationAuthorityServer, { StubCertificationAuthorityServer1 } from './StubCertificationAuthorityServer';
import StubOperatorServer from './StubOperatorServer';
/* eslint-enable */

const expressApp = Application.express.app;

describe('Certificate Manage API', () => {
    let certificateAuthorityServer: StubCertificationAuthorityServer;
    let operatorServer: StubOperatorServer;
    beforeAll(async () => {
        operatorServer = new StubOperatorServer(200);
        await new Common().executeSqlFile('initialData.sql');
        await Application.start();
    });
    afterAll(async () => {
        operatorServer._server.close();
        await Application.stop();
    });

    describe('クライアント証明書 証明書無効API', () => {
        let serialNo = 'a';
        let fingerPrint = 'a';
        describe('証明書保存前', () => {
            beforeAll(async () => {
                certificateAuthorityServer = new StubCertificationAuthorityServer('client', 200);
            });
            afterAll(async () => {
                certificateAuthorityServer._server.close();
            });
            test('正常系: 存在しないリソースの削除', async () => {
                const response = await supertest(expressApp)
                    .delete('/certificate-manage/' + serialNo + '/' + fingerPrint)
                    .set({
                        'content-type': 'application/json',
                        accept: 'application/json',
                        session: '%7B%22sessionId%22%3A%222212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca%22%2C%22operatorId%22%3A1%2C%22type%22%3A3%2C%22loginId%22%3A%22root_member01%22%2C%22name%22%3A%22%E9%81%8B%E5%96%B6%E3%83%A1%E3%83%B3%E3%83%90%E3%83%BC01%22%2C%22mobilePhone%22%3A%2209011112222%22%2C%22auth%22%3A%7B%22add%22%3Atrue%2C%22update%22%3Atrue%2C%22delete%22%3Atrue%7D%2C%22lastLoginAt%22%3A%222019-10-1814%3A07%3A43%22%2C%22passwordChangedFlg%22%3Afalse%2C%22attributes%22%3A%7B%7D%2C%22roles%22%3A%5B%7B%22_value%22%3A1%2C%22_ver%22%3A1%7D%5D%2C%22block%22%3A%7B%22_value%22%3A10001%2C%22_ver%22%3A1%7D%2C%22actor%22%3A%7B%22_value%22%3A10002%2C%22_ver%22%3A1%7D%7D'
                    })
                    .send();

                expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 400, message: '対象データが見つかりません' }));
                expect(response.status).toBe(400);
            });
        });
        describe('事前条件: 証明書登録', () => {
            beforeAll(async () => {
                certificateAuthorityServer = new StubCertificationAuthorityServer('client', 200);
            });
            afterAll(async () => {
                certificateAuthorityServer._server.close();
            });
            test('証明書の保存', async () => {
                const response = await supertest(expressApp).post('/certificate-manage')
                    .set({
                        'content-type': 'application/json',
                        accept: 'application/json',
                        session: '%7B%22sessionId%22%3A%222212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca%22%2C%22operatorId%22%3A1%2C%22type%22%3A3%2C%22loginId%22%3A%22root_member01%22%2C%22name%22%3A%22%E9%81%8B%E5%96%B6%E3%83%A1%E3%83%B3%E3%83%90%E3%83%BC01%22%2C%22mobilePhone%22%3A%2209011112222%22%2C%22auth%22%3A%7B%22add%22%3Atrue%2C%22update%22%3Atrue%2C%22delete%22%3Atrue%7D%2C%22lastLoginAt%22%3A%222019-10-1814%3A07%3A43%22%2C%22passwordChangedFlg%22%3Afalse%2C%22attributes%22%3A%7B%7D%2C%22roles%22%3A%5B%7B%22_value%22%3A1%2C%22_ver%22%3A1%7D%5D%2C%22block%22%3A%7B%22_value%22%3A10001%2C%22_ver%22%3A1%7D%2C%22actor%22%3A%7B%22_value%22%3A10002%2C%22_ver%22%3A1%7D%7D'
                    })
                    .send({
                        certType: 'client',
                        serialNo: 'XXXXXXXX',
                        fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                        certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                    });

                serialNo = response.body.serialNo;
                fingerPrint = response.body.fingerPrint;
                expect(response.status).toBe(200);
            });
        });
        describe('証明書保存後', () => {
            beforeAll(async () => {
                certificateAuthorityServer = new StubCertificationAuthorityServer('client', 200);
            });
            afterAll(async () => {
                certificateAuthorityServer._server.close();
            });
            test('正常系: 削除', async () => {
                const response = await supertest(expressApp)
                    .delete('/certificate-manage/' + serialNo + '/' + fingerPrint)
                    .set({
                        'content-type': 'application/json',
                        accept: 'application/json',
                        session: '%7B%22sessionId%22%3A%222212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca%22%2C%22operatorId%22%3A1%2C%22type%22%3A3%2C%22loginId%22%3A%22root_member01%22%2C%22name%22%3A%22%E9%81%8B%E5%96%B6%E3%83%A1%E3%83%B3%E3%83%90%E3%83%BC01%22%2C%22mobilePhone%22%3A%2209011112222%22%2C%22auth%22%3A%7B%22add%22%3Atrue%2C%22update%22%3Atrue%2C%22delete%22%3Atrue%7D%2C%22lastLoginAt%22%3A%222019-10-1814%3A07%3A43%22%2C%22passwordChangedFlg%22%3Afalse%2C%22attributes%22%3A%7B%7D%2C%22roles%22%3A%5B%7B%22_value%22%3A1%2C%22_ver%22%3A1%7D%5D%2C%22block%22%3A%7B%22_value%22%3A10001%2C%22_ver%22%3A1%7D%2C%22actor%22%3A%7B%22_value%22%3A10002%2C%22_ver%22%3A1%7D%7D'
                    })
                    .send();

                expect(JSON.stringify(response.body)).toBe(JSON.stringify({ result: 'success' }));
                expect(response.status).toBe(200);
            });
        });
        describe('事前条件: 証明書登録', () => {
            beforeAll(async () => {
                certificateAuthorityServer = new StubCertificationAuthorityServer('client', 200);
            });
            afterAll(async () => {
                certificateAuthorityServer._server.close();
            });
            test('証明書の保存', async () => {
                const response = await supertest(expressApp).post('/certificate-manage')
                    .set({
                        'content-type': 'application/json',
                        accept: 'application/json',
                        session: '%7B%22sessionId%22%3A%222212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca%22%2C%22operatorId%22%3A1%2C%22type%22%3A3%2C%22loginId%22%3A%22root_member01%22%2C%22name%22%3A%22%E9%81%8B%E5%96%B6%E3%83%A1%E3%83%B3%E3%83%90%E3%83%BC01%22%2C%22mobilePhone%22%3A%2209011112222%22%2C%22auth%22%3A%7B%22add%22%3Atrue%2C%22update%22%3Atrue%2C%22delete%22%3Atrue%7D%2C%22lastLoginAt%22%3A%222019-10-1814%3A07%3A43%22%2C%22passwordChangedFlg%22%3Afalse%2C%22attributes%22%3A%7B%7D%2C%22roles%22%3A%5B%7B%22_value%22%3A1%2C%22_ver%22%3A1%7D%5D%2C%22block%22%3A%7B%22_value%22%3A10001%2C%22_ver%22%3A1%7D%2C%22actor%22%3A%7B%22_value%22%3A10002%2C%22_ver%22%3A1%7D%7D'
                    })
                    .send({
                        certType: 'client',
                        serialNo: 'XXXXXXXX',
                        fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                        certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
                    });

                serialNo = response.body.serialNo;
                fingerPrint = response.body.fingerPrint;
                expect(response.status).toBe(200);
            });
        });
        describe('認証局サービスからのレスポンスに不備', () => {
            beforeAll(async () => {
                certificateAuthorityServer = new StubCertificationAuthorityServer1('client', 200);
            });
            afterAll(async () => {
                certificateAuthorityServer._server.close();
            });
            test('異常系: 削除対象の証明書が認証局サービスのものと一致しない', async () => {
                const response = await supertest(expressApp)
                    .delete('/certificate-manage/' + serialNo + '/' + fingerPrint)
                    .set({
                        'content-type': 'application/json',
                        accept: 'application/json',
                        session: '%7B%22sessionId%22%3A%222212d4a969f24f5e341470c546006d6552d1aa3c0cf60abc3002c5b29143c1ca%22%2C%22operatorId%22%3A1%2C%22type%22%3A3%2C%22loginId%22%3A%22root_member01%22%2C%22name%22%3A%22%E9%81%8B%E5%96%B6%E3%83%A1%E3%83%B3%E3%83%90%E3%83%BC01%22%2C%22mobilePhone%22%3A%2209011112222%22%2C%22auth%22%3A%7B%22add%22%3Atrue%2C%22update%22%3Atrue%2C%22delete%22%3Atrue%7D%2C%22lastLoginAt%22%3A%222019-10-1814%3A07%3A43%22%2C%22passwordChangedFlg%22%3Afalse%2C%22attributes%22%3A%7B%7D%2C%22roles%22%3A%5B%7B%22_value%22%3A1%2C%22_ver%22%3A1%7D%5D%2C%22block%22%3A%7B%22_value%22%3A10001%2C%22_ver%22%3A1%7D%2C%22actor%22%3A%7B%22_value%22%3A10002%2C%22_ver%22%3A1%7D%7D'
                    })
                    .send();

                expect(JSON.stringify(response.body)).toBe(JSON.stringify({ status: 400, message: '正しくない証明書が指定されました' }));
                expect(response.status).toBe(400);
            });
        });
    });
});
