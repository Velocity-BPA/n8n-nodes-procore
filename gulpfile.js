/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

const { src, dest } = require('gulp');
const rename = require('gulp-rename');

function buildIcons() {
  return src('nodes/**/*.svg')
    .pipe(rename((path) => {
      path.dirname = path.dirname.replace(/\\/g, '/');
    }))
    .pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
exports.default = buildIcons;
