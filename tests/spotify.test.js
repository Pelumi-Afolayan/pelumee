import test from 'node:test'
import assert from 'node:assert/strict'
import { createSpotifyHandler } from '../api/spotify.js'

const env = { SPOTIFY_CLIENT_ID:'test-id', SPOTIFY_CLIENT_SECRET:'test-secret', SPOTIFY_REFRESH_TOKEN:'test-refresh' }
const token = () => new Response(JSON.stringify({access_token:'private-access',expires_in:3600}),{status:200})
async function request(handler,method='GET') {
  let body
  const res = { statusCode:200, headers:{}, setHeader(key,value){this.headers[key]=value}, end(value){body=JSON.parse(value)} }
  await handler({method},res)
  return { body, status:res.statusCode, headers:res.headers }
}
test('unconfigured endpoint returns an honest state without calling Spotify',async()=>{
  const response=await request(createSpotifyHandler({},()=>{throw Error('Unexpected network')}))
  assert.deepEqual(response.body,{status:'not_connected'})
  assert.equal(response.headers['Cache-Control'],'no-store')
})
test('publishes only public track metadata; concurrent requests share work',async()=>{
  let calls=0
  const handler=createSpotifyHandler(env,async url=>{calls++; return url.includes('/api/token')?token():new Response(JSON.stringify({is_playing:true,device:{id:'private-device'},item:{type:'track',name:'Test track',artists:[{name:'Test artist'}],album:{name:'Test album',images:[{url:'https://example.com/art.jpg'}]},external_urls:{spotify:'https://open.spotify.com/track/test'}}}),{status:200})})
  const responses=await Promise.all([request(handler),request(handler),request(handler)])
  assert.equal(calls,2)
  assert.deepEqual(Object.keys(responses[0].body).sort(),['album','artist','image','status','title','url'])
  assert.equal(responses[0].body.status,'playing')
  for(const secret of ['private-access','private-device','test-secret','test-refresh']) assert.ok(!JSON.stringify(responses).includes(secret))
})
test('empty playback is idle and upstream failures never expose credentials',async()=>{
  const handler=createSpotifyHandler(env,async url=>url.includes('/api/token')?token():new Response(null,{status:204}))
  assert.deepEqual((await request(handler)).body,{status:'idle'})
  const failed=createSpotifyHandler(env,async()=>{throw Error('private test-secret details')})
  assert.deepEqual((await request(failed)).body,{status:'unavailable'})
})
test('unsupported content and private sessions are not published',async()=>{
  for(const result of [{item:{type:'episode'}},{device:{is_private_session:true},item:{type:'track'}}]) {
    const handler=createSpotifyHandler(env,async url=>url.includes('/api/token')?token():new Response(JSON.stringify(result),{status:200}))
    assert.deepEqual((await request(handler)).body,{status:'idle'})
  }
})
test('respects rate-limit cooldown before polling Spotify again',async()=>{
  let clock=1000, calls=0
  const handler=createSpotifyHandler(env,async url=>{calls++;return url.includes('/api/token')?token():new Response(null,{status:429,headers:{'retry-after':'120'}})},()=>clock)
  await request(handler); clock+=60000; await request(handler)
  assert.equal(calls,2)
  clock+=61000;await request(handler)
  assert.equal(calls,3)
})
test('rejects write methods',async()=>{
  const result=await request(createSpotifyHandler(env,()=>{throw Error('Unexpected network')}),'POST')
  assert.equal(result.status,405)
})
