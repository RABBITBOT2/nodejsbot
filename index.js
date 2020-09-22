const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.env.token;
const moment = require("moment");
require("moment-duration-format");
const momenttz = require('moment-timezone');
const MessageAdd = require('./db/message_add.js')
const welcomeChannelName = "오늘의이슈";
const byeChannelName = "오늘의이슈";
const welcomeChannelComment = "`님이 입장했습니다.`";
const byeChannelComment = "`님이 퇴장했습니다.`";
const adminUserId = 477076429058605056;
const weather = require('weather-js');

client.on('ready', () => {
  console.log('봇이켜졌습니다');
  client.user.setActivity('!도움', { type: 'STREAMING', url: 'https://www.twitch.tv/rnrygus0613'});

  let state_list = [
    '!도움',
    'BOT MADE BY RABBIT',
    '까실서버봇',
  ]
  let state_list_index = 3;
  let change_delay = 3000; // 이건 초입니당. 1000이 1초입니당.

  function changeState() {
    setTimeout(() => {
      // console.log( '상태 변경 -> ', state_list[state_list_index] );
      client.user.setPresence({ game: { name: state_list[state_list_index] }, status: 'online' })
      state_list_index += 3;
      if(state_list_index >= state_list.length) {
        state_list_index = 0;
      }
      changeState()
    }, change_delay);
  }

  changeState();
});

//client.on('message', async message => {
  //if (!message.guild) return;

  //if (message.content === '!들어와') {
    //if (message.member.voice.channel) {
      //const connection = await message.member.voice.channel.join();
    //} else {
      //message.reply('You need to join a voice channel first!');
    //}
  //}
//});

client.on("message", message => {
  let msg = message.content.toUpperCase();
  let cont = message.content.split("");
  let args = cont.slice(1);
  if (msg.startsWith('!날씨')) {
    weather.find({search: args.join(""), degreeType: 'C'}, function(err, result) {
      if (err) message.channel.send(err);
      if (result.length === 0) {
        const embed = new Discord.RichEmbed()
        .setTitle('오류')
        .setDescription('올바른 지역을 입력해주세요.')
        .setColor('#FF0000')
        embed.setTimestamp()
        message.channel.send(embed)
        return;
      }
      var current = result[0].current;
      var location = result[0].location;
      const embed = new Discord.RichEmbed()
      .setThumbnail(current.imageUrl)
      .setTitle(`${current.observationpoint}의 날씨`)
      .setColor('#F5FF00')
      .addField('날씨',`${current.skytext}`, true)
      .addField('온도',`${current.temperature}˚`, true)
      .addField('체감온도',`${current.feelslike}˚`, true)
      .addField('바람',`${current.winddisplay}`, true)
      .addField('습도',`${current.humidity}%`, true)
      .addField('데이터 출처',`[링크](http://weather.service.msn.com/find.aspx)`)
      embed.setTimestamp()
      message.channel.send(embed)
    });
  }
});

client.on("guildMemberAdd", (member) => {
  const guild = member.guild;
  const newUser = member.user;
  const welcomeChannel = guild.channels.find(channel => channel.name == welcomeChannelName);

  welcomeChannel.send(`📥 **${newUser.username}**${welcomeChannelComment}\n`);

  member.addRole(guild.roles.find(role => role.name == "일반인"));
});

client.on("guildMemberRemove", (member) => {
  const guild = member.guild;
  const deleteUser = member.user;
  const byeChannel = guild.channels.find(channel => channel.name == byeChannelName);

  byeChannel.send(`📤 **${deleteUser.username}**${byeChannelComment}\n`);
});

client.on('message', (message) => {
  if(message.author.bot) return;

  if(message.channel.type == 'dm') {
    if(message.author.id == adminUserId) return;

     let embed = new Discord.RichEmbed()
     let img = message.author.avatar ? `https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128` : undefined;
     let user = message.author.username+'#'+message.author.discriminator
     let msg = message.content;
     embed.setColor('#186de6')
     embed.setAuthor(user+'이(가) 메세지를 보냈습니다.', img)
     embed.setFooter(`BOT MADE BY RABBIT`)
     embed.addField('메세지 내용', msg, true);
     embed.setTimestamp()
     client.users.find(x => x.id == adminUserId).send(embed);
  }

  if(message.content.startsWith('!역할추가')) {
    if(message.channel.type == 'dm') {
      return message.reply('`dm에서 사용할 수 없는 명령어 입니다.`');
    }
    if(message.channel.type != 'dm' && checkPermission(message)) return

    if(message.content.split('<@').length == 3) {
      if(message.content.split(' ').length != 3) return;

      var userId = message.content.split(' ')[1].match(/[\u3131-\uD79D^a-zA-Z^0-9]/ugi).join('')
      var role = message.content.split(' ')[2].match(/[\u3131-\uD79D^a-zA-Z^0-9]/ugi).join('')

      message.member.guild.members.find(x => x.id == userId).addRole(role);
    }
  }

  if(message.content == '!정보') {
    let embed = new Discord.RichEmbed()
    let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
    var duration = moment.duration(client.uptime).format(" D [일], H [시간], m [분], s [초]");
    embed.setColor('RANDOM')
    embed.setTitle('까실서버봇의 정보')
    embed.setFooter(`BOT MADE BY RABBIT`)
    embed.setThumbnail(img)
    embed.addField('RAM 사용량', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true);
    embed.addField('실행 시간', `${duration}`, true);
    embed.addField('유저수', `${client.users.size.toLocaleString()}`, true);
    embed.addField('서버수', `${client.guilds.size.toLocaleString()}`, true);
    //embed.addField('channel', `${client.channels.size.toLocaleString()}`, true);
    embed.addField('Discord.js 버전', `v${Discord.version}`, true);
    embed.addField('Node 버전', `${process.version}`, true);
    embed.addField('오픈소스', `[링크](https://github.com/RABBITBOT2/nodejsbot)`, true)
    //let arr = client.guilds.array();
    //let list = '';
    //list = `\`\`\`css\n`;
    
    //for(let i=0;i<arr.length;i++) {
      // list += `${arr[i].name} - ${arr[i].id}\n`
      //list += `${arr[i].name}\n`
    //}
    //list += `\`\`\`\n`
    //embed.addField('list:',        `${list}`);
    embed.setTimestamp()
    message.channel.send(embed)
  }

  //if(message.content == '!날씨') {
    //let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
    //let embed = new Discord.RichEmbed()
      //.setTitle(':white_sun_cloud: 인천광역시 부평의 오늘날씨')
      //.addField('**온도**', '최저 21˚\n최고26˚', true)
      //.addField('**체감온도**', '21.9˚', true)
      //.addField('**날씨**', '비', true)
      //.addField('**미세먼지**', '좋음(56㎍/㎥)', true)
      //.addField('**초미세먼지**', '좋음(35㎍/㎥)', true)
      //.addField('**오존지수**', '보통(0.031ppm)', true)
      //.setColor('#F5FF00')
      //.setFooter('2020년 09월 06일 기준입니다', img)
      //embed.setTimestamp()
      //message.channel.send(embed)

if(message.content == '!한강물온도') {
        let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
        let embed = new Discord.RichEmbed()
          .setTitle(':ocean: 현재 한강물의 온도')
          .addField('**한강물의 온도**', '22.1℃', true)
          .setColor('#0011ff')
          .setFooter('2020년 09월 06일 기준입니다', img)
          embed.setTimestamp()
      message.channel.send(embed)



    } else if(message.content == '!유저정보') {
      let img = `${message.author.avatarURL}`
      let embed = new Discord.RichEmbed()
      .setTitle(message.author.username+"의 유저정보")
      .setThumbnail(img)
      .setColor("RANDOM")
      .addField("전체이름", `${message.author.username}#${message.author.discriminator}`,true)
      .addField("이름", `${message.author.username}`, true)
      .addField("태그", `${message.author.discriminator}`, true)
      .addField("아이디", `${message.author.id}`, true)
      .addField("프로필링크", `[프로필사진 링크](${message.author.avatarURL})`, true)
      .addField("만든날짜", `${message.author.createdAt}`)
      .addField("들어온날짜", message.member.joinedAt)
    message.channel.send(embed)



    } else if(message.content == '!공지사항') {
      let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
      let embed = new Discord.RichEmbed()
        .setTitle('까실서버 공지사항',img)
        .setDescription('**```diff\n-2020.03.02.\n+공지사항 채널이 생겼습니다.\n+여기서는 기자단과 관리자들이 성명 발표를 하거나 정책변경시 늬우스를 전해드리겠습니다\n```** **```diff\n-2020.03.02.\n+앞으로 우리 가-실서버의 기득권들의 횡포를 위해 반란을 논하는자가 나오면 그자의 목은 몹시 위험해질 것 입니다\n```** **```diff\n-2020.03.23.\n+이 서버에 들어올려면 디스코드 이메일 인증이 완료되고 5분이 지나야 들어올 수 있습니다\n```** **```diff\n-2020.05.26.\n+오늘부터 원맨쇼 금지입니다\n+솔직히 뭔말인지 모를분 계실겁니다\n+이서버에서 원맨쇼의 정의 알려드릴게요\n+혼자 부계를 파거나 파서 자기랑 자기가 대화하는것, 자아분열로 의심되는 행동이 보일경우 숙청입니다 이게 은근 하는얘들도 있고 싫어하는 사람도 많아서 금지시키겠습니다\n```** **```diff\n-2020.05.28.\n+그리고 노래가 매인 컨텐츠인 영상외에 틀면 제제당합니다!\n+명령어는 잡담에서 치지말고 명령어 방에서 치세요\n```** **```diff\n-2020.06.07.\n+에브리원 태그 맨날 쓰는것도 그렇고 아예 안쓰는것도 그러니까 한명당 1주일에 한번씩만 에브리원 태그 쓰도록 합시다\n```** **```diff\n-2020.08.11.\n+이런행동을 하면 뮤트를 당합니다!\n+1. 똑같은 단어나 문장을 5번이상 1분안에 보낼경우\n+2. 삭제빌런을 과도하게 할 경우\n+3. 통화방을 과도하게 들락날락 할 경우\n```** **```diff\n-2020.09.13.\n+봇에 관한 피드백이나 봇버그 같은거 있으면 봇에게 DM해주세요.\n```** **```diff\n-2020.09.19\n+봇기능 추가 요청 할때 db필요한거는 요청하지 마세여. 자바에 필요한 db를 다룰줄도 모르고 요청할거면 db파일 들고오세요. (db는 데이터베이스입니다. 이거 없어도 만들수는 있는데 봇 껏다 키면 다 초기화 됩니다.)\n```**')
        .setColor('#FF0000')
        .setFooter('까실서버 공지')
    embed.setTimestamp()
    message.channel.send(embed)
      
  } else if(message.content == '!초대코드') {
    if(message.channel.type == 'dm') {
      return message.reply('dm에서 사용할 수 없는 명령어 입니다.');
    }
    message.guild.channels.get(message.channel.id).createInvite({maxAge: 0}) // maxAge: 0은 무한이라는 의미, maxAge부분을 지우면 24시간으로 설정됨
      .then(invite => {
        message.channel.send(invite.url)
      })

    } else if(message.content.startsWith('!전체공지')) {
      if(checkPermission(message)) return
      if(message.member != null) { // 채널에서 공지 쓸 때
        let contents = message.content.slice('!전체공지'.length);
        let img = message.author.avatar ? `https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128` : undefined;
        let embed = new Discord.RichEmbed()
          .setTitle('까실서버 전체 공지사항',img)
          .setColor('RANDOM')
          .setFooter(`BOT MADE BY RABBIT`)
          .setTimestamp()
    
        embed.setDescription(contents);
    
        message.member.guild.members.array().forEach(x => {
          if(x.user.bot) return;
          x.user.send(embed)
        });
    
        return message.reply('공지를 전송했습니다.');
      } else {
        return message.reply('채널에서 실행해주세요.');
      }

     } else if(message.content == '!코로나 순위') {
      let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
      let embed = new Discord.RichEmbed()
        .setTitle('코로나-19 한국 순위')
        .addField('**데이터 출처 : Ministry of Health and Welfare of Korea**', 'http://ncov.mohw.go.kr/index.jsp', true)
        .setColor('#6799FF')
        .addField('**최신 데이터**', '해당 자료는 2020년 9월 6일 00시 기준 자료입니다.')
        .addField('**대구 ■■■■■■■■■■■■■■■■■■■■■■■■■■■■ (7,082)**', '**서울 ■■■■■■■■■■■■■■■■■■■■■■ (4,314)**')
        .addField('**경기 ■■■■■■■■■■■■■■■■■■■■■ (3,625)**', '**경북 ■■■■■■■■■■■■■■■■■■■■ (1,475)**')
        .addField('**검역 ■■■■■■■■■■■■■■■■■ (1,376)**', '**인천 ■■■■■■■■■■■■■ (796)**')
        .addField('**광주 ■■■■■■■■■■■■ (420)**', '**충남 ■■■■■■■■■■■ (380)**')
        .addField('**부산 ■■■■■■■■■■ (331)**', '**대전 ■■■■■■■■■ (293)**')
        .addField('**경남 ■■■■■■■■■ (257)**', '**강원 ■■■■■■■■ (210)**')
        .addField('**전남 ■■■■■■■■ (159)**', '**충북 ■■■■■■ (141)**')
        .addField('**울산 ■■■■■ (113)**', '**전북 ■■■ (90)**')
        .addField('**세종 ■■ (67)**', '**제주 ■ (48)**')
        .setFooter('BOT MADE BY RABBIT', img)
        embed.setTimestamp()
    message.channel.send(embed)
                
  } else if(message.content == '!핑') {
    let embed = new Discord.RichEmbed()
    .setTitle('핑(MS)')
    .setDescription(client.ping + ' `MS`')
    .setColor("RANDOM")
    embed.setTimestamp()
message.channel.send(embed)


    } else if(message.content == '!코로나 전국') {
      let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
      let embed = new Discord.RichEmbed()
        .setTitle('코로나-19 한국 현황')
        .addField('**데이터 출처 : Ministry of Health and Welfare of Korea**', 'http://ncov.mohw.go.kr/index.jsp', true)
        .addField('**최신 데이터**', '해당 자료는 2020년 9월 7일 00시 기준 자료입니다.')
        .addField('**확진환자(누적)**', '21,177(+ 167)', true)
        .addField('**완치환자(격리해제)**', '16,146(+ 137)', true)
        .addField('**치료중(격리 중)**', '4,697(+ 29)', true)
        .addField('**사망**', '334(+ 1)', true)
        .addField('**누적확진률**', '1.1 %', true)
        .addField('**- 최신 브리핑 1 : 코로나바이러스감염증-19 국내 발생 현황 (9월 6일)**', '링크 : http://ncov.mohw.go.kr/tcmBoardView.do?contSeq=359764')
        .addField('**- 최신 브리핑 2 : 코로나바이러스감염증-19 정례브리핑 (9월 6일)**', '링크 : http://ncov.mohw.go.kr/tcmBoardView.do?contSeq=359766')
        .setColor('#6799FF')
        .setFooter('BOT MADE BY RABBIT', img)
        embed.setTimestamp()
    message.channel.send(embed)

  } else if(message.content == '!코로나 인천') {
    let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
    let embed = new Discord.RichEmbed()
      .setTitle('코로나-19 인천 현황')
      .addField('**데이터 출처 : Ministry of Health and Welfare of Korea**', 'http://ncov.mohw.go.kr/index.jsp', true)
      .addField('**최신 데이터**', '해당 자료는 2020년 7월 18일 00시 기준 자료입니다.')
      .addField('**확진환자(누적)**', '796(+ 12)', true)
      .addField('**완치환자(격리해제)**', '492', true)
      .addField('**치료중(격리 중)**', '301', true)
      .addField('**사망**', '3', true)
      .addField('**10만명당 발생률**', '26.93명', true)
      .addField('**전국대비 확진자 비율**', '3.76 %', true)
      .addField('**- 최신 브리핑 1 : 코로나바이러스감염증-19 국내 발생 현황 (9월 6일)**', '링크 : http://ncov.mohw.go.kr/tcmBoardView.do?contSeq=359764')
      .addField('**- 최신 브리핑 2 : 코로나바이러스감염증-19 정례브리핑 (9월 6일)**', '링크 : http://ncov.mohw.go.kr/tcmBoardView.do?contSeq=359766')
      .setColor('#6799FF')
      .setFooter('BOT MADE BY RABBIT', img)
      embed.setTimestamp()
      
  message.channel.send(embed)

} else if(message.content == '!코로나 서울') {
  let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
  let embed = new Discord.RichEmbed()
    .setTitle('코로나-19 서울 현황')
    .addField('**데이터 출처 : Ministry of Health and Welfare of Korea**', 'http://ncov.mohw.go.kr/index.jsp', true)
    .addField('**최신 데이터**', '해당 자료는 2020년 9월 6일 00시 기준 자료입니다.')
    .addField('**확진환자(누적)**', '4,314(+ 63)', true)
    .addField('**완치환자(격리해제)**', '2,225', true)
    .addField('**치료중(격리 중)**', '2,063', true)
    .addField('**사망**', '26', true)
    .addField('**10만명당 발생률**', '44.32명', true)
    .addField('**전국대비 확진자 비율**', '20.37 %', true)
    .addField('**- 최신 브리핑 1 : 코로나바이러스감염증-19 국내 발생 현황 (9월 6일)**', '링크 : http://ncov.mohw.go.kr/tcmBoardView.do?contSeq=359764')
    .addField('**- 최신 브리핑 2 : 코로나바이러스감염증-19 정례브리핑 (9월 6일)**', '링크 : http://ncov.mohw.go.kr/tcmBoardView.do?contSeq=359766')
    .setColor('#6799FF')
    .setFooter('BOT MADE BY RABBIT', img)
    
    embed.setTimestamp()
message.channel.send(embed)

} else if(message.content == '!코로나 경기') {
  let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
  let embed = new Discord.RichEmbed()
    .setTitle('코로나-19 경기 현황')
    .addField('**데이터 출처 : Ministry of Health and Welfare of Korea**', 'http://ncov.mohw.go.kr/index.jsp', true)
    .addField('**최신 데이터**', '해당 자료는 2020년 9월 6일 00시 기준 자료입니다.')
    .addField('**확진환자(누적)**', '3,625(+ 47)', true)
    .addField('**완치환자(격리해제)**', '2,359', true)
    .addField('**치료중(격리 중)**', '1,221', true)
    .addField('**사망**', '45', true)
    .addField('**10만명당 발생률**', '27.36명', true)
    .addField('**전국대비 확진자 비율**', '17.12 %', true)
    .addField('**- 최신 브리핑 1 : 코로나바이러스감염증-19 국내 발생 현황 (9월 6일)**', '링크 : http://ncov.mohw.go.kr/tcmBoardView.do?contSeq=359764')
    .addField('**- 최신 브리핑 2 : 코로나바이러스감염증-19 정례브리핑 (9월 6일)**', '링크 : http://ncov.mohw.go.kr/tcmBoardView.do?contSeq=359766')
    .setColor('#6799FF')
    .setFooter('BOT MADE BY RABBIT', img)
    
    embed.setTimestamp()
message.channel.send(embed)

    } else if(message.content == '!재난문자') {
        let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
        let embed = new Discord.RichEmbed()
          .setTitle(':loudspeaker: 재난문자')
          .addField('**데이터 출처 : 대한민국 재난안전포털**', 'https://www.safekorea.go.kr/idsiSFK/neo/main_m/dis/disasterDataList.html')
          .addField('**2020/07/18 13:00:28 재난문자[함평군청]**', '[함평군청] 7일(월)새벽 영향권 외부부착물(노후간판,첨탑 등)결박,전기차단 창문 빈틈없이 고정 농작물,농업시설등 지주고정,결박 각종 시설물 안전조치')
          .addField('**2020/07/18 12:44:03 재난문자[순천군청]**', '[순천시청] 태풍 ‘하이선’ 내일 오전 7시 최근접. 강풍 및 집중호우가 예상되니, 해안가, 급경사지 접근 금지, 낙하물 주의, 외출자제 등 안전에 유의바랍니다.')
          .addField('**2020/07/18 12:21:02 재난문자[고창구청]**', '[고창군청] 7일(월) 0시 태풍예비특보발효, 내일 새벽부터~낮 최대 영향, 저지대 위험지역 주민 사전대피, 각종 시설물 사전 점검, 내일부터는 외출 자제바랍니다.')
          .setColor('#FF0000')
          .setFooter('최근 발송된 3개의 재난문자를 보여줍니다', img)
          embed.setTimestamp()
    message.channel.send(embed)
  } else if(message.content == '!오늘의 운세') {
      const Random = ["오늘은 순조로운날이에요","오늘은 다른 이성에게 고백해보세요","소원을 한번 빌어보세요 아무일도 일어나지 않지만 그냥 빌어보세요","용기내서 말하면 소원이 이루어집니다 ","이 문자는 10000분의 1로 나오는 까실서버봇 키스권을 드립니다","팔굽혀 펴기 20회를 쉬지않고 가동범위 최대로 한다면 좋아하는 이성에게 고백받을거에요","턱걸이 연속 5개 또는 머슬업 1개라도 성공시 좋아하는 이성에게 69%로 고백받을수 있어요","당당하게 행동하면 좋은일이 생깁니다","우울한 음악을 듣지말고 기쁜노래만 들으려고 하세요","오늘은 연상의 연인과 만나는 날이에요","오늘은 동갑의 연인과 만나는 날이에요 ","당신이 가진 패가 좋은 패여도 절대 보여주지 마세요","오늘은 이쁜여자를 만날수 있지만 고백하면 차입니다","이글을 본다면 당신에게 관리자 권한을 주지 않지아니한다는 부분에 저 박준서는 동의하지 않지않다는 점에서 매우 찬성하지 아니하면 저의 의견을 매우 지지하지 않는다는 모습을 본 저는 당신에게 관리자를 주고싶지 않지아니하지않습니다","열심히 하는 벌꿀이 되어서 온 우주가 나서서 도와주도록 하는 벌꿀 넣을게","첫번째 정답과 바꾼 정답이 햇갈린다면 첫번째 정답으로 하세요 ","자신을 비난하지 마세요","배려하면서 살면 의견충돌로 인한 싸움이 없어요","자신이 잘못한 행동이 있으면 시원하게 말하고 발 쭉 뻗고 자세요 ","자기관리를 꾸준히 하세요","갑자기 이유없이 짜증난다면 심호흡 한번하세요 ","지구가 사실 평평하답니다! 당신도 믿으세요!  전 안믿을 겁니다!","가짜뉴스를 거르는 능력을 기를필요가 있어보이네요","이기적인 사람은 멀리하세요 당신이 간디만큼 너그럽지 않다면 멀리하세요 ","남들이 하기싫어하는 일이 있으면 하려고 하세요","일찍일어나고 일찍 자는 습관이 삶의 질을 바꿉니다 ","늦잠 자지말고 일찍 일어날 자신없으면 늦게 자지도 마세요 ","운동을 하다가 지쳐서 더이상 할수없을때 한개만 더 해도 자극이 많이오니까 한개라도 더 하고 끝내세요","항상 자기 뜯대로 일이 풀리지는 않습니다 그니까 뭐 실망스러운 일이 있어도 자책하지 마시고 좋은일 있으면 최대한 기뻐하세요","이상한 컨셉잡는걸 하지마세요 좆같은 컨셉은 사람들도 불쾌합니다","모임에 없는사람을 욕하는 사람을 멀리하고 맞장구 치지 마세요 ","이 운세믿지말고 본인이 스스로 하는것도 좋을거 같네요","무조건 하나만 정답이라고 생각하지 마세요","뭐든지 연습을 많이하세요 ","진짜 억울한 일이있으면 침착하세요 ","남을 속이려고 하지말고 남을 속이려는 사람과는 멀리하세요","약속을 자주 어기는사람과는 어울리지 마세요","누군가 당신에거 갑작스럽게 다가오면 의심부터 하세요","문제가 안풀리면 친구에게 공유하세요 ","진짜 믿을수 있는사람이 아니면 되도록 믿지 마세요","우울하다면 가장 잘하는걸 해보세요","운동을 하면서 얻는 보람을 느껴보세요","말 하기전에 한번만 더 생각해보세요","노빠꾸다 라면서 함부로 이성에게 고백하지 마세요 ","자신이 가장 잘할수 있는걸 찾아보세요","와","뒷광고는 환영입니다"]
      const Real = Random[Math.floor(Math.random()*Random.length) + 1]
     let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
      let user_name = message.author.username
      const Embed = new Discord.RichEmbed()
        .setFooter(user_name + "님의 오늘의 운세",img)
        .setTitle(Real)
    message.channel.send(Embed)


  } else if(message.content.startsWith('!주사위')) {
    let min = 1;
    let max = 6;
    let dice_num = parseInt(Math.random() * (max - min) + min);
    return message.reply(`${dice_num} 이(가) 나왔습니다.`);


  } else if(message.content.startsWith('!랜덤숫자')) {
    let min = 1;
    let max = 999999;
    let dice_num = parseInt(Math.random() * (max - min) + min);
    return message.reply(`${dice_num} 이(가) 나왔습니다.`);



  } else if(message.content == '!도움') {
      let helpImg = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
      let commandList = [
        {name: '!도움 관리자', desc: '관리자 명령어를 알려줍니다.'},
        {name: '!도움 코로나', desc: '코로나 명령어를 알려줍니다.'},
        {name: '!도움 날씨', desc: '날씨 명령어를 알려줍니다.'},
        {name: '!도움 기타', desc: '기타 명령어를 알려줍니다.'},
    ];
      let commandStr = '';
      let embed = new Discord.RichEmbed()
        .setAuthor('도움', helpImg)
        .setColor('#ff00df')
        .setFooter(`BOT MADE BY RABBIT`)
        commandList.forEach(x => {
          commandStr += `• \`\`${changeCommandStringLength(`${x.name}`)}\`\` : **${x.desc}**\n`;
        });

    embed.addField('명령어: ', commandStr);
    embed.setTimestamp()
    message.channel.send(embed)

  } else if(message.content == '!도움 관리자') {
    let helpImg = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
    let commandList = [
      {name: '!청소', desc: '텍스트 지우기!'},
      {name: '!역할추가', desc: '!역할추가 @이름 @역할 으로 역할을 추가합니다.'},
      {name: '!전체공지', desc: '!전체공지 내용을 하면 DM으로 전체공지를 합니다.'},
      {name: '!강퇴', desc: '!강퇴 @이름 을 하면 강퇴를 합니다.'},
      {name: '!밴', desc: '!밴 @이름 을 하면 밴을 합니다.'},
  ];
    let commandStr = '';
    let embed = new Discord.RichEmbed()
      .setAuthor('도움 관리자', helpImg)
      .setColor('#ff00df')
      .setFooter(`BOT MADE BY RABBIT`)
      commandList.forEach(x => {
        commandStr += `• \`\`${changeCommandStringLength(`${x.name}`)}\`\` : **${x.desc}**\n`;
      });

  embed.addField('명령어: ', commandStr);
  embed.setTimestamp()
  message.channel.send(embed)

} else if(message.content == '!도움 코로나') {
  let helpImg = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
  let commandList = [
    {name: '!코로나 전국', desc: '코로나 전국'},
    {name: '!코로나 서울', desc: '코로나 서울'},
    {name: '!코로나 인천', desc: '코로나 인천'},
    {name: '!코로나 경기', desc: '코로나 경기'},
    {name: '!코로나 순위', desc: '코로나 순위'},
];
  let commandStr = '';
  let embed = new Discord.RichEmbed()
    .setAuthor('도움 코로나', helpImg)
    .setColor('#ff00df')
    .setFooter(`BOT MADE BY RABBIT`)
    commandList.forEach(x => {
      commandStr += `• \`\`${changeCommandStringLength(`${x.name}`)}\`\` : **${x.desc}**\n`;
    });

embed.addField('명령어: ', commandStr);
embed.setTimestamp()
message.channel.send(embed)

} else if(message.content == '!도움 날씨') {
  let helpImg = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
  let commandList = [
    {name: '!재난문자', desc: '최근 재난문자 3개를 보여줍니다!'},
    {name: '!날씨 지역', desc: '오늘의 날씨 보기!'},
    {name: '!한강물온도', desc: '한강물의 온도 보기!'},
];
  let commandStr = '';
  let embed = new Discord.RichEmbed()
    .setAuthor('도움 날씨', helpImg)
    .setColor('#ff00df')
    .setFooter(`BOT MADE BY RABBIT`)
    commandList.forEach(x => {
      commandStr += `• \`\`${changeCommandStringLength(`${x.name}`)}\`\` : **${x.desc}**\n`;
    });

embed.addField('명령어: ', commandStr);
embed.setTimestamp()
message.channel.send(embed)

} else if(message.content == '!도움 기타') {
  let helpImg = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
  let commandList = [
    {name: '!공지사항', desc: '까실서버의 공지사항들을 알려줍니다.'},
    {name: '!오늘의 운세', desc: '오늘의 운세를 알려줍니다.'},
    {name: '!핑', desc: '봇의 핑을 알려줍니다.'},
    {name: '봇에게 DM', desc: '봇의 버그나 문제가 있을시 봇에게 DM 보내면 됩니다.'},
    {name: '!정보', desc: '봇의 정보를 보여줍니다.'},
    {name: '!주사위', desc: '주사위를 굴려줍니다.'},
    {name: '!초대코드', desc: '까실서버 초대코드를 보내줍니다.'},
    {name: '!랜덤숫자', desc: '랜덤으로 숫자를 띄워줍니다(77777이 나오면 선물드립니다)'},
    {name: '!유저정보', desc: '유저의 정보를 보여줍니다.'},
    //{name: '!들어와', desc: '봇이 음성채널에 들어옵니다.'},
];
  let commandStr = '';
  let embed = new Discord.RichEmbed()
    .setAuthor('도움 기타', helpImg)
    .setColor('#ff00df')
    .setFooter(`BOT MADE BY RABBIT`)
    commandList.forEach(x => {
      commandStr += `• \`\`${changeCommandStringLength(`${x.name}`)}\`\` : **${x.desc}**\n`;
    });

embed.addField('명령어: ', commandStr);
embed.setTimestamp()
message.channel.send(embed)

  } else if(message.content.startsWith('!청소')) {
    if(message.channel.type == 'dm') {
      return message.reply('`dm에서 사용할 수 없는 명령어 입니다.`');
    }
    
    if(message.channel.type != 'dm' && checkPermission(message)) return

    var clearLine = message.content.slice('!청소 '.length);
    var isNum = !isNaN(clearLine)

    if(isNum && (clearLine <= 0 || 100 < clearLine)) {
      message.channel.send("`1부터 100까지의 숫자만 입력해주세요.`")
      return;
    } else if(!isNum) { // c @나긋해 3
      if(message.content.split('<@').length == 2) {
        if(isNaN(message.content.split(' ')[2])) return;

        var user = message.content.split(' ')[1].split('<@!')[1].split('>')[0];
        var count = parseInt(message.content.split(' ')[2])+1;
        let _cnt = 0;

        message.channel.fetchMessages().then(collected => {
          collected.every(msg => {
            if(msg.author.id == user) {
              msg.delete();
              ++_cnt;
            }
            return !(_cnt == count);
          });
        });
      }
    } else {
      message.channel.bulkDelete(parseInt(clearLine)+1)
        .then(() => {
          AutoMsgDelete(message, `<@${message.author.id}> ` + parseInt(clearLine) + "`개의 메시지를 삭제했습니다. (이 메세지는 잠시 후에 사라집니다.)`");
        })
        .catch(console.error)
    }
  } else if(message.content.startsWith('!강퇴')) {
    if(message.channel.type == 'dm') {
      return message.reply('dm에서 사용할 수 없는 명령어 입니다.');
    }
    
    if(message.channel.type != 'dm' && checkPermission(message)) return

    console.log(message.mentions);

    let userId = message.mentions.users.first().id;
    let kick_msg = message.author.username+'#'+message.author.discriminator+'이(가) 강퇴시켰습니다.';
    
    message.member.guild.members.find(x => x.id == userId).kick(kick_msg)
  } else if(message.content.startsWith('!밴')) {
    if(message.channel.type == 'dm') {
      return message.reply('dm에서 사용할 수 없는 명령어 입니다.');
    }
    
    if(message.channel.type != 'dm' && checkPermission(message)) return

    console.log(message.mentions);

    let userId = message.mentions.users.first().id;
    let kick_msg = message.author.username+'#'+message.author.discriminator+'이(가) 강퇴시켰습니다.';

    message.member.guild.members.find(x => x.id == userId).ban(kick_msg)
  }
});

function checkPermission(message) {
  if(!message.member.hasPermission("MANAGE_MESSAGES")) {
    message.channel.send(`<@${message.author.id}> ` + "`관리자 권한을 소지하고 있지않습니다.`")
    return true;
  } else {
    return false;
  }
}


function changeCommandStringLength(str, limitLen = 8) {
  let tmp = str;
  limitLen -= tmp.length;

  for(let i=0;i<limitLen;i++) {
      tmp += ' ';
  }

  return tmp;
}

async function AutoMsgDelete(message, str, delay = 3000) {
  let msg = await message.channel.send(str);

  setTimeout(() => {
    msg.delete();
  }, delay);
}

function getEmbedFields(message, modify=false) {
  if(message.content == '' && message.embeds.length > 0) {
    let e = message.embeds[0].fields;
    let a = [];

    for(let i=0;i<e.length;i++) {
        a.push(`\`${e[i].name}\` - \`${e[i].value}\`\n`);
    }

    return a.join('');
  } else if(modify) {
    return message.author.lastMessage.content;
  } else {
    return message.content;
  }
}

function MessageSave(message, modify=false) {
  imgs = []
  if (message.attachments.array().length > 0) {
    message.attachments.array().forEach(x => {
      imgs.push(x.url+'\n')
    });
  }

  username = message.author.username.match(/[\u3131-\uD79D^a-zA-Z^0-9]/ugi)
  channelName = message.channel.type != 'dm' ? message.channel.name : ''
  try {
    username = username.length > 1 ? username.join('') : username
  } catch (error) {}

  try {
    channelName = channelName.length > 1 ? channelName.join('') : channelName
  } catch (error) {}

  var s = {
    ChannelType: message.channel.type,
    ChannelId: message.channel.type != 'dm' ? message.channel.id : '',
    ChannelName: channelName,
    GuildId: message.channel.type != 'dm' ? message.channel.guild.id : '',
    GuildName: message.channel.type != 'dm' ? message.channel.guild.name : '',
    Message: getEmbedFields(message, modify),
    AuthorId: message.author.id,
    AuthorUsername: username + '#' + message.author.discriminator,
    AuthorBot: Number(message.author.bot),
    Embed: Number(message.embeds.length > 0), // 0이면 false 인거다.
    CreateTime: momenttz().tz('Asia/Seoul').locale('ko').format('ll dddd LTS')
  }

  s.Message = (modify ? '[수정됨] ' : '') + imgs.join('') + s.Message

  MessageAdd(
    s.ChannelType,
    s.ChannelId,
    s.ChannelName,
    s.GuildId,
    s.GuildName,
    s.Message,
    s.AuthorId,
    s.AuthorUsername,
    s.AuthorBot,
    s.Embed,
    s.CreateTime,
  )
    // .then((res) => {
    //   console.log('db 저장을 했다.', res);
    // })
    .catch(error => console.log(error))
}






client.login(token);