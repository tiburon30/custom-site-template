const path = require('path');
const gulp = require('gulp');
const process = require('child_process');

let vvv = 'ssh vvv';
let domain = 'DOMAIN';
let vvvPath = '/srv/www/PATH';
let localPath = path.join(__dirname, '../');
let remotePath = '/home/web/sites/PATH';

gulp.task('deploy', ['deploy-plugin', 'deploy-theme'], (cb) => {
  cb();
});

gulp.task('deploy-plugin', () => {
  let source = `${localPath}/public_html/wp-content/plugins/core/`;
  let dest = `hetzner:${remotePath}/public_html/wp-content/plugins/core/`;
  let params = `-av --checksum --delete --exclude 'node_modules'`;

  command(`composer install -o -d ${localPath}/public_html/wp-content/plugins/core`, { stdio: [0, 1, 2] });
  command(`rsync ${source} ${dest} ${params}`, { stdio: [0, 1, 2] });
});

gulp.task('deploy-theme', () => {
  let source = `${localPath}/public_html/wp-content/themes/bigbet/`;
  let dest = `hetzner:${remotePath}/public_html/wp-content/themes/bigbet/`;
  let params = `-av --checksum --delete --exclude 'node_modules'`;

  command(`rsync ${source} ${dest} ${params}`, { stdio: [0, 1, 2] });
});

gulp.task('copy-db', () => {
  command(`ssh hetzner wp db export ${remotePath}/dump.sql --path='${remotePath}/public_html'`);
  command(`scp hetzner:${remotePath}/dump.sql ${localPath}/dump.sql`);
  command(`${vvv} wp db import ${vvvPath}/dump.sql --path='${vvvPath}/public_html'`);
  command(`${vvv} wp option update siteurl http://${domain} --path='${vvvPath}/public_html'`);
  command(`${vvv} wp option update home http://${domain} --path='${vvvPath}/public_html'`);
  command(`${vvv} rm ${vvvPath}/dump.sql`);
});

gulp.task('copy-uploads', () => {
  let source = `hetzner:${remotePath}/public_html/wp-content/uploads/`;
  let dest = `${localPath}/public_html/wp-content/uploads/`;
  let params = `-av --exclude 'node_modules'`;

  command(`rsync ${params} ${source} ${dest}`, { stdio: [0, 1, 2] });
});

function command(command) {
  process.execSync(command, { stdio: [0, 1, 2] });
}
