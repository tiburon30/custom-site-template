const path = require('path');
const gulp = require('gulp');
const process = require('child_process');

let vvv = 'ssh vvv';
let domain = 'DOMAIN';
let vvvPath = '/srv/www/PATH';
let localPath = path.join(__dirname, '../');
let remotePath = '/home/web/sites/PATH';

let corePlugin = 'PLUGIN';

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

  command(`rsync ${params} ${source} ${dest}`);
});

gulp.task('build-plugin', () => {
  command(`composer install -o -d ${localPath}/public_html/wp-content/plugins/${corePlugin}`);
});

gulp.task('deploy-plugin', ['build-plugin'], () => {
  let path = `public_html/wp-content/plugins/${corePlugin}/`;
  let params = `-av --checksum --delete --exclude 'node_modules'`;

  command(`rsync ${localPath}/${path} hetzner:${remotePath}/${path} ${params}`);
});

gulp.task('deploy-themes', () => {
  let path = `public_html/wp-content/themes/`;
  let params = `-av --checksum --delete --exclude 'node_modules'`;

  command(`rsync ${localPath}/${path} hetzner:${remotePath}/${path} ${params}`);
});

gulp.task('deploy', ['deploy-plugin', 'deploy-themes'], done => {
  done();
});

function command(command) {
  process.execSync(command, { stdio: [0, 1, 2] });
}
