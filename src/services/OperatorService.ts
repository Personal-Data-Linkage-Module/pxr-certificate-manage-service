/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import request = require('request');
import AppError from '../common/AppError';
import OperatorDomain from '../domains/OperatorDomain';
import { Request } from 'express';
import { doPostRequest } from '../common/DoRequest';
import config = require('config');
import Config from '../common/Config';
/* eslint-enable */
const Message = Config.ReadConfig('./config/message.json');

/**
 * オペレーターサービスとの連携クラス
 */
export default class OperatorService {
    /**
     * オペレーターのセッション情報を取得する
     * @param req リクエストオブジェクト
     */
    static async authMe (req: Request): Promise<OperatorDomain> {
        const configure = Config.ReadConfig('./config/config.json');
        const { cookies } = req;
        const sessionId = OperatorService.getSessionId(cookies);
        // Cookieからセッションキーが取得できた場合、オペレーターサービスに問い合わせる
        if (typeof sessionId === 'string' && sessionId.length > 0) {
            const sessionData = JSON.stringify({ sessionId: sessionId });
            const options: request.CoreOptions = {
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(sessionData)
                },
                body: sessionData
            };
            try {
                const result = await doPostRequest(
                    configure['operatorServiceSession'],
                    options
                );
                // ステータスコードにより制御
                const { statusCode } = result.response;
                OperatorService.throwErrorIfFailed(statusCode);
                let sessionResult = result.body;
                while (typeof sessionResult === 'string') {
                    sessionResult = JSON.parse(sessionResult);
                }
                return new OperatorDomain(sessionResult);
            } catch (err) {
                throw new AppError(
                    Message.FAILED_CONNECT_TO_OPERATOR, 500, err);
            }

        // ヘッダーにセッション情報があれば、それを流用する
        } else if (req.headers.session) {
            let data = decodeURIComponent(req.headers.session + '');
            while (typeof data === 'string') {
                data = JSON.parse(data);
            }
            return new OperatorDomain(data, req.headers.session + '');

        // セッション情報が存在しない場合、未ログインとしてエラーをスローする
        } else {
            throw new AppError(Message.NOT_AUTHORIZED, 401);
        }
    }

    private static throwErrorIfFailed (statusCode: number) {
        if (statusCode === 204 || statusCode === 400) {
            throw new AppError(Message.NOT_AUTHORIZED, 401);
        } else if (statusCode !== 200) {
            throw new AppError(Message.FAILED_TAKE_SESSION, 500);
        }
    }

    private static getSessionId (cookies: Request) {
        return cookies[OperatorDomain.TYPE_PERSONAL_KEY] ||
               cookies[OperatorDomain.TYPE_APPLICATION_KEY] ||
               cookies[OperatorDomain.TYPE_MANAGER_KEY];
    }
}
