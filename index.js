const fs = require('fs');
const Twit = require('twit');
const metrics = require('datadog-metrics');

let raw = fs.readFileSync('./config.json');
let config = JSON.parse(raw);

metrics.init({ host: 'onetap', prefix: 'onetap_v2.', appKey: config['appKey'], apiKey: config['apiKey'] });

let T = new Twit({
  consumer_key: config['CONSUMER_KEY'],
  consumer_secret: config['CONSUMER_SECRET'],
  access_token: config['ACCESS_TOKEN'],
  access_token_secret: config['ACCESS_TOKEN_SECRET']
});

let teamJokowi = 0;
let teamPrabowo = 0;

let jokowi = 0;
let prabowo = 0;
let pemilu = 0;

let jkwStream = T.stream('statuses/filter', { track: '#JokoWinElection'} );

jkwStream.on('tweet', (tweet) => {
  teamJokowi = teamJokowi + 1
  console.log(`${new Date()}: JKW ${tweet.user.screen_name}(${tweet.user.id}) ${tweet.text} (${tweet.retweet_count}/${tweet.favorite_count})`)
})

let prbStream = T.stream('statuses/filter', { track: '#TheVictoryOfPrabowo'} );

prbStream.on('tweet', (tweet) => {
  teamPrabowo = teamPrabowo + 1
  console.log(`${new Date()}: PRB ${tweet.user.screen_name}(${tweet.user.id}) ${tweet.text} (${tweet.retweet_count}/${tweet.favorite_count})`)
})

let pemiluStream = T.stream('statuses/filter', { track: '#Pemilu2019'} );

pemiluStream.on('tweet', (tweet) => {
  pemilu = pemilu + 1
  console.log(`${new Date()}: PEMILU ${tweet.user.screen_name}(${tweet.user.id}) ${tweet.text} (${tweet.retweet_count}/${tweet.favorite_count})`)
})

setInterval(() => {
  metrics.gauge(`stream.teamJkw`, teamJokowi);
  metrics.gauge(`stream.teamPrb`, teamPrabowo);
  metrics.gauge(`stream.jkw`, jokowi);
  metrics.gauge(`stream.prb`, prabowo);
  metrics.gauge(`stream.pemilu`, pemilu);
  jokowi = 0;
  prabowo = 0;
  pemilu = 0;
  teamJokowi = 0;
  teamPrabowo = 0;
}, 120000) //every 5 minutes report to datadog