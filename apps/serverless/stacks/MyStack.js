import fs from 'fs-extra';
import * as path from 'path';

import * as lambda from 'aws-cdk-lib/aws-lambda';

import { Api } from '@serverless-stack/resources';

export function MyStack({ stack, app }) {
  // via https://github.com/serverless-stack/sst/blob/master/examples/prisma/stacks/MyStack.ts
  if (!app.local) {
    // Create a layer for production
    // This saves shipping Prisma binaries once per function

    // in a monorepo, use root node_modules dir
    const prismaNodeModulesParent = '../..';
    const layerPath = '.sst/layers/prisma';

    // Clear out the layer path
    fs.removeSync(layerPath, { force: true, recursive: true });
    fs.mkdirSync(layerPath, { recursive: true });

    // Copy files to the layer
    const toCopy = [
      'node_modules/.prisma',
      'node_modules/@prisma/client',
      'node_modules/prisma/build',
    ];
    for (const file of toCopy) {
      fs.copySync(path.join(prismaNodeModulesParent, file), path.join(layerPath, 'nodejs', file), {
        // Do not include binary files that aren't for AWS to save space
        filter: (src) => !src.endsWith('so.node') || src.includes('rhel'),
      });
    }
    const prismaLayer = new lambda.LayerVersion(stack, 'PrismaLayer', {
      code: lambda.Code.fromAsset(path.resolve(layerPath)),
    });

    // Add to all functions in this stack
    stack.addDefaultFunctionLayers([prismaLayer]);
  }

  const api = new Api(stack, 'api', {
    defaults: {
      function: {
        environment: {
          DATABASE_URL: process.env.DATABASE_URL,
        },
        bundle: {
          // Only reference external modules when deployed
          externalModules: app.local ? [] : ['@prisma/client', '.prisma'],
        },
      },
    },
    routes: {
      'GET /': 'functions/doggos.handler',
      'GET /hello': 'functions/hello.handler',
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
