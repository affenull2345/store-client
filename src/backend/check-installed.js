import { installers } from './install-app';

export default async function checkInstalled(app){
  let error = new Error('No installers found');
  let [method, loader] = app.getIdentificationMethod();
  for(let i = 0; i < installers.length; i++){
    let result;
    try {
      result = await loader();
    } catch(e) {
      console.error('CheckInstall prepare error', e);
      error = e;
    }

    if(result.error){
      console.error('Store error', result.error);
      throw result.error;
    }

    try {
      return await installers[i][method].apply(installers[i], result.args);
    } catch(e) {
      console.error('CheckInstall error', e);
      error = e;
    }
  }
  throw error;
}
