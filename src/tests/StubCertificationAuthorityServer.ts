/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Server } from 'net';
/* eslint-enable */
import * as express from 'express';

/**
 * 認証局サービス
 */
export default class StubCertificationAuthorityServer {
    _app: express.Express;
    _server: Server;

    constructor (certType: string, status: number) {
        this._app = express();

        // イベントハンドラー
        const _rootlistener = (req: express.Request, res: express.Response) => {
            res.status(certType === 'actor' ? 200 : status);
            res.json({
                certType: 'root',
                subject: {
                    C: 'JP',
                    ST: 'Tokyo',
                    L: 'Minato-ku',
                    O: 'aaa Corporation',
                    OU: 'PXR',
                    CN: '*.---.co.jp'
                },
                serialNo: 'XXXXXXXX',
                fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                validPeriodStart: '2019-01-01T00:00:00',
                validPeriodEnd: '2024-12-31T23:59:59',
                certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
            });
        };
        const _serverlistener = (req: express.Request, res: express.Response) => {
            res.status(certType === 'actor' ? 200 : status);
            res.json({
                certType: 'server',
                subject: {
                    C: 'JP',
                    ST: 'Tokyo',
                    L: 'Minato-ku',
                    O: 'test-org',
                    OU: 'test-unit',
                    CN: '*.---.co.jp'
                },
                serialNo: 'XXXXXXXX',
                fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                validPeriodStart: '2019-01-01T00:00:00',
                validPeriodEnd: '2024-12-31T23:59:59',
                certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
            });
        };
        const _clientlistener = (req: express.Request, res: express.Response) => {
            res.status(certType === 'actor' ? 200 : status);
            res.json({
                certType: 'client',
                subject: {
                    C: 'JP',
                    ST: 'Tokyo',
                    L: 'Minato-ku',
                    O: 'test-org',
                    OU: 'test-unit',
                    CN: '*.---.co.jp'
                },
                serialNo: 'XXXXXXXX',
                fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                validPeriodStart: '2019-01-01T00:00:00',
                validPeriodEnd: '2024-12-31T23:59:59',
                certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
            });
        };
        const _actorlistener = (req: express.Request, res: express.Response) => {
            if (status === 0) {
                res.destroy();
                return;
            }
            res.status(status);
            if (certType === 'root') {
                res.json({
                    block: null,
                    actor: null
                });
            } else {
                res.json({
                    block: {
                        value: 10001,
                        ver: 1
                    },
                    actor: {
                        value: 10002,
                        ver: 2
                    }
                });
            }
        };

        // ハンドラーのイベントリスナーを追加、アプリケーションの起動
        this._app.get('/certification-authority/root', _rootlistener);
        this._app.get('/certification-authority/root&from_path=/certificate-manage', _rootlistener);
        this._app.get('/certification-authority/server/:serialNo/:fingerPrint', _serverlistener);
        this._app.get('/certification-authority/server/:serialNo/:fingerPrint&from_path=/certificate-manage', _serverlistener);
        this._app.get('/certification-authority/client/:serialNo/:fingerPrint', _clientlistener);
        this._app.get('/certification-authority/client/:serialNo/:fingerPrint&from_path=/certificate-manage', _clientlistener);
        this._app.get('/certification-authority/actor/:serialNo/:fingerPrint', _actorlistener);
        this._app.get('/certification-authority/actor/:serialNo/:fingerPrint&from_path=/certificate-manage', _actorlistener);
        this._server = this._app.listen(3012);
    }
}

export class StubCertificationAuthorityServer1 {
    _app: express.Express;
    _server: Server;

    constructor (certType: string, status: number) {
        this._app = express();

        // イベントハンドラー
        const _rootlistener = (req: express.Request, res: express.Response) => {
            res.status(certType === 'actor' ? 200 : status);
            res.json({
                certType: 'root',
                subject: {
                    C: 'JP',
                    ST: 'Tokyo',
                    L: 'Minato-ku',
                    O: 'aaa Corporation',
                    OU: 'PXR',
                    CN: '*.---.co.jp'
                },
                serialNo: 'XXXXXXXX',
                fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                validPeriodStart: '2019-01-01T00:00:00',
                validPeriodEnd: '2024-12-31T23:59:59',
                certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
            });
        };
        const _serverlistener = (req: express.Request, res: express.Response) => {
            res.status(certType === 'actor' ? 200 : status);
            res.json({
                certType: 'server',
                subject: {
                    C: 'JP',
                    ST: 'Tokyo',
                    L: 'Minato-ku',
                    O: 'test-org',
                    OU: 'test-unit',
                    CN: '*.---.co.jp'
                },
                serialNo: 'XXXXXXXX',
                fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                validPeriodStart: '2019-01-01T00:00:00',
                validPeriodEnd: '2024-12-31T23:59:59',
                certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----'
            });
        };
        const _clientlistener = (req: express.Request, res: express.Response) => {
            res.status(certType === 'actor' ? 200 : status);
            res.json({
                certType: 'client',
                subject: {
                    C: 'JP',
                    ST: 'Tokyo',
                    L: 'Minato-ku',
                    O: 'test-org',
                    OU: 'test-unit',
                    CN: '*.---.co.jp'
                },
                serialNo: 'XXXXXXXX',
                fingerPrint: 'XX:XX:XX:XX:XX:XX:XX:XX',
                validPeriodStart: '2019-01-01T00:00:00',
                validPeriodEnd: '2024-12-31T23:59:59',
                certificate: '-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygH\r\n-----END CERTIFICATE-----'
            });
        };
        const _actorlistener = (req: express.Request, res: express.Response) => {
            if (status === 0) {
                res.destroy();
                return;
            }
            res.status(status);
            if (certType === 'root') {
                res.json({
                    block: null,
                    actor: null
                });
            } else {
                res.json({
                    block: {
                        value: 10001,
                        ver: 1
                    },
                    actor: {
                        value: 10002,
                        ver: 2
                    }
                });
            }
        };

        // ハンドラーのイベントリスナーを追加、アプリケーションの起動
        this._app.get('/certification-authority/root', _rootlistener);
        this._app.get('/certification-authority/server/:serialNo/:fingerPrint', _serverlistener);
        this._app.get('/certification-authority/client/:serialNo/:fingerPrint', _clientlistener);
        this._app.get('/certification-authority/actor/:serialNo/:fingerPrint', _actorlistener);
        this._server = this._app.listen(3012);
    }
}
