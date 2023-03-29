/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
INSERT INTO pxr_certificate_manage.certificate_manage
(
    cert_type, 
    subject, 
    serial_no, finger_print, 
    valid_period_start, valid_period_end, 
    certificate, 
    actor_code, actor_version,
    block_code, block_version,
    is_distributed, is_disabled, created_by, created_at, updated_by, updated_at
    )
values
(
    'root',
    '{ "C": "JP", "ST": "Tokyo", "L": "Minato-ku", "O": "aaa Corporation", "OU": "PXR", "CN": "*.---.co.jp" }',
    'XXXXX1', 'YYYYY1', 
    '2020-01-01', '2120-12-31', 
	'-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----',
    null, null, 
    null, null, 
    false, false, 'pxr_user', NOW(), 'pxr_user', NOW()
);
INSERT INTO pxr_certificate_manage.certificate_manage
(
    cert_type, 
    subject, 
    serial_no, finger_print, 
    valid_period_start, valid_period_end, 
    certificate, 
    actor_code, actor_version,
    block_code, block_version,
    is_distributed, is_disabled, created_by, created_at, updated_by, updated_at
    )
values
(
    'server',
    '{ "C": "JP", "ST": "Tokyo", "L": "Minato-ku", "O": "test-org", "OU": "test-unit", "CN": "*.---.co.jp" }',
    'XXXXX2', 'YYYYY2', 
    '2020-01-01', '2120-12-31', 
	'-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----',
    null, null, 
    10002, 2, 
    false, false, 'pxr_user', NOW(), 'pxr_user', NOW()
);
INSERT INTO pxr_certificate_manage.certificate_manage
(
    cert_type, 
    subject, 
    serial_no, finger_print, 
    valid_period_start, valid_period_end, 
    certificate, 
    actor_code, actor_version,
    block_code, block_version,
    is_distributed, is_disabled, created_by, created_at, updated_by, updated_at
    )
values
(
    'client',
    '{ "C": "JP", "ST": "Tokyo", "L": "Minato-ku", "O": "test-org", "OU": "test-unit", "CN": "*.---.co.jp" }',
    'XXXXX3', 'YYYYY3', 
    '2020-01-01', '2120-12-31', 
	'-----BEGIN RSA PRIVATE KEY-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END RSA PRIVATE KEY-----\r\n-----BEGIN CERTIFICATE-----\r\nMIGrAgEAAiEAvnrd8LBnzAGxCW+i7KtVQSiTsssMtbwcs5styeKsn2kCAwEAAQIh\r\nAKBF8glb5Xqa0cQG0ygg4hIFdipmvEJhiCuhX93krDCBAhEA51bAM0gFPvxyk9Xe\r\nioIOBQIRANLJEv4Xw7MwT7EEEARL5RUCEBa8bu1bUbCsDPK8nT+NoqUCEQCIzFCU\r\nMY4j7BW8N3vBnhPlAhBgs4tSfe6RbpertixmCygk\r\n-----END CERTIFICATE-----',
    10001, 1, 
    10002, 2,
    false, false, 'pxr_user', NOW(), 'pxr_user', NOW()
);
