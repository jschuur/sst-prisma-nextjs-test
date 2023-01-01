import { App } from '@serverless-stack/resources';
import { MyStack } from './MyStack';

/**
 * @param {App} app
 */
export default function (app) {
  app.setDefaultFunctionProps({
    runtime: 'nodejs16.x',
    srcPath: 'services',
    bundle: {
      format: 'esm',
    },
  });
  app.stack(MyStack);
}
