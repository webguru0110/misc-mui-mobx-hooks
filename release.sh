#!/bin/bash

set -e

yarn validate
yarn build
npm publish --access public
