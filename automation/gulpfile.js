const gulp = require('gulp');
const process = require('child_process');

let theme = '';
let domain = '';
let local_path = '/srv/www/PATH';
let remote_path = '/home/web/sites/PATH';
let vvv = 'ssh vvv';
let prod = 'ssh hetzner';

gulp.task('deploy', ['deploy-plugin', 'deploy-theme'], (cb) => {
  cb();
  process.execSync(`${vvv} wp ${source} ${dest} ${params}`);
  process.execSync(`${prod} wp rewrite flush --path=${remote_path}/public_html`);
});

gulp.task('deploy-plugin', ['build-plugin'], () => {
  let params = `-av --checksum --delete --exclude 'node_modules' --chmod=D775,F664`;
  let source = `${local_path}/public_html/wp-content/plugins/wp-core-plugin/`;
  let dest = `hetzner:${remote_path}/public_html/wp-content/plugins/wp-core-plugin/`;
  process.execSync(`${vvv} rsync ${source} ${dest} ${params}`);
});

gulp.task('deploy-theme', ['build-theme'], () => {
  let params = `-av --checksum --delete --exclude 'node_modules' --chmod=D775,F664`;
  let source = `${local_path}/public_html/wp-content/themes/${theme}/`;
  let dest = `hetzner:${remote_path}/public_html/wp-content/themes/${theme}/`;
  process.execSync(`${vvv} rsync ${source} ${dest} ${params}`);
});

gulp.task('build-plugin', done => {
  process.execSync(`composer install -o -d ../public_html/wp-content/plugins/wp-core-plugin`);
  done();
});

gulp.task('build-theme', done => {
  process.execSync(`gulp build --cwd ../public_html/wp-content/themes/${theme}/`);
  process.execSync(`composer install -o -d ../public_html/wp-content/themes/${theme}/`);
  done();
});

gulp.task('copy-db', () => {
  process.execSync(`${vvv} ${prod} wp db export ${remote_path}/dump.sql --path='${remote_path}/public_html'`);
  process.execSync(`${vvv} scp hetzner:${remote_path}/dump.sql ${local_path}/dump.sql`);
  process.execSync(`${vvv} wp db import ${local_path}/dump.sql --path='${local_path}/public_html'`);
  process.execSync(`${vvv} wp option update siteurl http://${domain} --path='${local_path}/public_html'`);
  process.execSync(`${vvv} wp option update home http://${domain} --path='${local_path}/public_html'`);
  process.execSync(`${vvv} rm ${local_path}/dump.sql`);
});

gulp.task('copy-uploads', () => {
  let params = `-av --exclude 'node_modules' --chmod=D775,F664`;
  let source = `hetzner:${remote_path}/public_html/wp-content/uploads/`;
  let dest = `${local_path}/public_html/wp-content/uploads/`;
  process.execSync(`${vvv} rsync ${params} ${source} ${dest}`);
});
