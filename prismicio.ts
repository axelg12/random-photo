import * as prismic from '@prismicio/client';
import sm from './sm.json';

export function createClient(options?: any) {
  return prismic.createClient(sm.apiEndpoint, options);
}
