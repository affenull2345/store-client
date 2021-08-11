const installers = [
  require('./installer/mozapps-import').default,
];

export default async function installApp(app, progress){
  let error = new Error('No installers found');
  let [method, loader] = app.getInstallationMethod();
  for(let i = 0; i < installers.length; i++){
    let result;
    try {
      result = await loader(progress);
    } catch(e) {
      console.error('Installation prepare error', e);
      error = e;
    }

    if(result.error){
      console.error('Store error', result.error);
      throw result.error;
    }

    try {
      console.log(`Trying with <installer #${i}>.${method}`);
      return await installers[i][method].apply(installers[i], result.args);
    } catch(e) {
      console.error('Install error', e);
      error = e;
    }
  }
  throw error;
}
