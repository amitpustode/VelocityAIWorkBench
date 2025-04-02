import { store, storeEvents } from './storeManager';

export let Default_Provider = store.get('provider');
export let Default_ttool = store.get('trackingtool');
export let Default_Embed_Provider = store.get('embedprovider');
export let OPENAI_URL = store.get(`configJson.${Default_Provider}.endpoint`);
export let OPENAI_MODEL = store.get(`configJson.${Default_Provider}.model`);
export let IMAGINEX_OPENAI_KEY = store.get(`configJson.${Default_Provider}.apiKey`);
export let BRAVO_OPENAI_KEY = store.get(`configJson.${Default_Provider}.apiKey`);
export let JIRAEMAIL = store.get(`ttconfigJson[0].email`);
export let JIRAENDPOINT = store.get(`ttconfigJson[0].endpoint`);
export let JIRAPROJECTKEY = store.get(`ttconfigJson[0].projectkey`);
export let JIRATOKEN = store.get(`ttconfigJson[0].projecttoken`);
export let EMBED_URL = store.get(`embedconfigJson.${Default_Provider}.endpoint`);
export let EMBED_MODEL = store.get(`embedconfigJson.${Default_Provider}.model`);
export let EMBED_API_KEY = store.get(`embedconfigJson.${Default_Provider}.apiKey`);
export let SEARCH_PREFERENCE = store.get(`searchpreference`);

function reloadConfiguration() {
    Default_Provider = store.get('provider');
    Default_ttool = store.get('ttool');
    Default_Embed_Provider = store.get('embedprovider');
    OPENAI_URL = store.get(`configJson.${Default_Provider}.endpoint`);
    OPENAI_MODEL = store.get(`configJson.${Default_Provider}.model`);
    IMAGINEX_OPENAI_KEY = store.get(`configJson.${Default_Provider}.apiKey`);
    BRAVO_OPENAI_KEY = store.get(`configJson.${Default_Provider}.apiKey`);
    JIRAEMAIL = store.get(`ttconfigJson[0].email`);
    JIRAENDPOINT = store.get(`ttconfigJson[0].endpoint`);
    JIRAPROJECTKEY = store.get(`ttconfigJson[0].projectkey`);
    JIRATOKEN = store.get(`ttconfigJson[0].projecttoken`);
    EMBED_URL = store.get(`embedconfigJson.${Default_Provider}.endpoint`);
    EMBED_MODEL = store.get(`embedconfigJson.${Default_Provider}.model`);
    EMBED_API_KEY = store.get(`embedconfigJson.${Default_Provider}.apiKey`);
    SEARCH_PREFERENCE = store.get(`searchpreference`);
    console.log('Configurations Reloaded');
}

// Initial load
reloadConfiguration();

// Listen for updates
storeEvents.on('update', (key) => {
    if (key.startsWith('configJson.') || key === 'provider' || key === 'searchpreference') {
        reloadConfiguration();
    }
});
