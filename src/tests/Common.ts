/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import path = require('path');
import fs = require('fs');
import { Connection } from 'typeorm';
import { connectDatabase } from '../common/Connection';
/* eslint-enable */

// テスト用にlisten数を無制限に設定
require('events').EventEmitter.defaultMaxListeners = 0;

/**
 * URL
 */
export namespace Url {
    /**
     * ベースURL
     */
    export const baseURI: string = '/certificate-manage';
}

/**
 * テスト用共通クラス
 */
export default class Common {
    private conn: Connection;
    async connect () {
        this.conn = await connectDatabase();
    }

    async disconnect () {
        this.conn.destroy();
    }

    /**
     * SQLファイル実行
     * @param fileName
     */
    public async executeSqlFile (fileName: string) {
        // ファイルをオープン
        const fd: number = fs.openSync(path.join('./ddl/unit-test/', fileName), 'r');

        // ファイルからSQLを読込
        const sql: string = fs.readFileSync(fd, 'utf-8');

        // ファイルをクローズ
        fs.closeSync(fd);

        // DBを初期化
        await (await connectDatabase()).query(sql);
    }

    /**
     * SQL実行
     * @param sql
     */
    public async executeSqlString (sql: string) {
        // DBを初期化
        await (await connectDatabase()).query(sql);
    }
}
