const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.env.token;
const moment = require("moment");
require("moment-duration-format");
const welcomeChannelName = "오늘의이슈";
const byeChannelName = "오늘의이슈";
const welcomeChannelComment = "`님이 입장했습니다.`";
const byeChannelComment = "`님이 퇴장했습니다.`";
const adminUserId = 477076429058605056;

client.on('ready', () => {
  console.log('봇이켜졌습니다');
  client.user.setActivity('!도움', { type: 'STREAMING', url: 'https://www.twitch.tv/rnrygus0613'});

  let state_list = [
    '!도움',
    'BOT MADE BY RABBIT',
    '까실서버봇',
  ]
  let state_list_index = 1;
  let change_delay = 3000; // 이건 초입니당. 1000이 1초입니당.

  function changeState() {
    setTimeout(() => {
      // console.log( '상태 변경 -> ', state_list[state_list_index] );
      client.user.setPresence({ game: { name: state_list[state_list_index] }, status: 'online' })
      state_list_index += 1;
      if(state_list_index >= state_list.length) {
        state_list_index = 0;
      }
      changeState()
    }, change_delay);
  }

  // changeState();
});

client.on("guildMemberAdd", (member) => {
  const guild = member.guild;
  const newUser = member.user;
  const welcomeChannel = guild.channels.find(channel => channel.name == welcomeChannelName);

  welcomeChannel.send(`<@${newUser.id}> ${welcomeChannelComment}\n`);

  member.addRole(guild.roles.find(role => role.name == "일반인"));
});

client.on("guildMemberRemove", (member) => {
  const guild = member.guild;
  const deleteUser = member.user;
  const byeChannel = guild.channels.find(channel => channel.name == byeChannelName);

  byeChannel.send(`*${deleteUser.id}* ${byeChannelComment}\n`);
});

client.on('message', (message) => {
  if(message.content === '!초대코드') {
    message.reply('https://discord.gg/pEKuapz');
  }
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
    embed.setAuthor('까실서버봇의 정보', img)
    embed.setFooter(`BOT MADE BY RABBIT`)
    embed.addBlankField()
    embed.addField('RAM usage',    `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true);
    embed.addField('running time', `${duration}`, true);
    embed.addField('user',         `${client.users.size.toLocaleString()}`, true);
    embed.addField('server',       `${client.guilds.size.toLocaleString()}`, true);
    //embed.addField('channel',      `${client.channels.size.toLocaleString()}`, true);
    embed.addField('Discord.js',   `v${Discord.version}`, true);
    embed.addField('Node',         `${process.version}`, true);
    embed.addField('오픈소스',      `https://github.com/RABBITBOT2/nodejsbot`, true)
    
    let arr = client.guilds.array();
    let list = '';
    list = `\`\`\`css\n`;
    
    for(let i=0;i<arr.length;i++) {
      // list += `${arr[i].name} - ${arr[i].id}\n`
      list += `${arr[i].name}\n`
    }
    list += `\`\`\`\n`
    embed.addField('list:',        `${list}`);
    embed.setTimestamp()
    message.channel.send(embed);
  }

  if(message.content == '!날씨') {
    let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
    let embed = new Discord.RichEmbed()
      .setTitle(':white_sun_cloud: 인천광역시 부평의 오늘날씨')
      .addField('**온도**', '최저 21˚\n최고26˚', true)
      .addField('**체감온도**', '21.9˚', true)
      .addField('**날씨**', '비', true)
      .addField('**미세먼지**', '좋음(56㎍/㎥)', true)
      .addField('**초미세먼지**', '좋음(35㎍/㎥)', true)
      .addField('**오존지수**', '보통(0.031ppm)', true)
      .setColor('#F5FF00')
      .setFooter('2020년 09월 06일 기준입니다', img)

      message.channel.send(embed)
    } else if(message.content == '!한강물온도') {
        let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
        let embed = new Discord.RichEmbed()
          .setTitle(':ocean: 현재 한강물의 온도')
          .addField('**한강물의 온도**', '22.1℃', true)
          .setColor('#0011ff')
          .setFooter('2020년 09월 06일 기준입니다', img)
      message.channel.send(embed)
      
              } else if(message.content == '!코로나') {
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
                    .setAuthor('코로나', helpImg)
                    .setColor('#ff00df')
                    .setFooter(`BOT MADE BY RABBIT`)
                    commandList.forEach(x => {
                      commandStr += `• \`\`${changeCommandStringLength(`${x.name}`)}\`\` : **${x.desc}**\n`;
                    });
            
                embed.addField('명령어: ', commandStr);
               
                message.channel.send(embed)
                
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

    message.channel.send(embed)
  } else if(message.content == '!오늘의 운세') {
      const Random = ["오늘은 몸조심 하세요.","오늘은 입조심 하세요.","오늘은 사기당하지않게 조심하세요.","오늘은 실망스러운 일이 일어날 수 있습니다.","오늘은 순조로운 날이 될거에요.","오늘은 기쁨이 가득할거에요.","오늘은 겸손하게 행동하세요.","오늘은 다른 이성에게 고백해보세요.","오늘은 돈이 생길수도 있습니다.","오늘은 일이 잘 풀리지 않을수있습니다.","오늘은 밖에 되도록 나가지 마세요.","오늘은 소원이 이루어질수 있습니다.","오늘은 연상의 연인을 만나게 되는날입니다.","오늘은 연하의 연인을 만나게 되는날입니다.","오늘은 일이 잘 풀리는 날입니다.","오늘은 힘을 사용하는 일을 하지마세요.","오늘은 까실이가 밥을 사줄수도 있어요.","채팅치시다가 점멸 누르지 마세요!","오늘은 왠지 채팅치다가 궁쓸거 같아요ㅠㅠ","노빠꾸로 가시죠!","사릴줄도 알아야 해요!","오늘은 정치질 조심하세요!","오늘 의상은 길거리에서 커플들이 싸울때 구경하면서 지나가는 사람을 구경할것 같은 의상이군요!","밤 길 조심하세요!","미안하다 이거 보여주려고 어그로끌었다.. 나루토 사스케 싸움수준 ㄹㅇ실화냐? 진짜 세계관최강자들의 싸움이다.. 그찐따같던 나루토가 맞나? 진짜 나루토는 전설이다..진짜옛날에 맨날나루토봘는데 왕같은존재인 호카게 되서 세계최강 전설적인 영웅이된나루토보면 진짜내가다 감격스럽고 나루토 노래부터 명장면까지 가슴울리는장면들이 뇌리에 스치면서 가슴이 웅장해진다.. 합체한거봐라 진짜 ㅆㅂ 이거보고 개충격먹어가지고 와 소리 저절로 나오더라? 하.. ㅆㅂ 사스케 보고싶다..  진짜언제 이렇게 신급 최강들이 되었을까 옛날생각나고 나 중딩때생각나고 뭔가 슬프기도하고 좋기도하고 감격도하고 여러가지감정이 복잡하네.. 아무튼 나루토는 진짜 애니중최거명작임..","당신은 이 문자를 발견하셨어요 1/69 의 확률로 나오는 이 문자는 발견시 박준서 키스권을 드립니다!","오늘 의상은 길가는 찐다를 보고 혐오하는 사람을 짝사랑 하던 사람을 구경하던 사람의 친구같은 의상이에요! 아주 완벽하지만 완벽하지 않아요!","오늘은 따뜻하지만 차갑고 뜨거운 아이스 라떼를 먹는건 어떨까요?","내 눈을 바라봐","오늘은 운동을 해봐요!","피하지 말고 즐기세요","오늘은 취킨을 먹을거 같군요!","오늘은 길 가다가 물웅덩이에 빠질것 같군요! 라는 애니 추천좀","오늘은 시간이 빨리갈거에요!","팔굽혀 펴기 쉬지않고 20개 하면 좋은일이 생길거에요!","새로운걸 시도해보세요!","책을 읽어보세요! (야설말고)","등장밑이 어두워요!","당당하게 행동하세요!","겸손하게 행동하세요!","오늘은 입닥치고 사세요!","팔굽혀 펴기 40개를하면 이쁜이성에게 고백받을거에요!","닥치고 버피테스트 10회 하세요","오늘은 시간이 존1나 느리게 갈거에요!","오늘 말하면 거절당합니다!","틱톡광고 면제권 1매","불을끄세요! 당신 램좀보게","알려줘 너의 RGB값","오늘은 흥겨울겁니다!","팔굽혀 펴기 30회를 한다면 존나 행복한 하루가 될수있어요!","오늘니기분 컬러로 말할게 ","공부보다 연습해야할건 현피워","현피보다 연습해야할건 공부워","오늘 고백하면 까입니다!","오늘 고백하면 성공합니다 ","오늘 고백하면 집으로 be back 합니다!(라임 미쳤고","이편지는 영국에서 최초로 시작되어 미안하다 이거보여주려고 어그로 끌었다 봇개발자 관리자 싸움수준 ㄹㅇ 실화냐? 진짜 세계관 최강자들의 싸움이다 관리자가 사회주의의 낙원으로 오세요! 할때 가슴이 웅장해진다 진짜 봇개발자는 전설이다....","안녕하세요 박준서입니다 이 메세지는 10000분의 1확률로 나오는 메세지입니다 까실서버 이용해주셔서 감사하고요 봇도 잘 이용해 주셔서 감사합니다 처음시작할땐 반응이 좋은거 같다가 반응이 다시 사그라 들었는데요 다시이렇게 많지는 않지만 제게는 많게느껴지는 사람들이 와서 놀고있으니까 정말 기쁩니다 정말 감사하고요 잘 이용해 주세요!","밖에한번 나가봐요!","집에있기보다 날씨가 좋다면 나가서 미세먼지좀 마시고 오세요","집에있기보다 날씨가 좋다면 나가서 미세먼지좀 마시고 오세요","선풍기 바람보다 밖에나가서 미세먼지 섞인 바람을 느끼세요!","운동을 하는건 어떨까요?","큐브맞추는걸 도전해보세요!","금딸하면 좋은일이 생길거에요!","이 문장이 나오면 구교현이 밥을 안사줘요!","오늘은 고백하기 딱좋은 날씨네요","오늘은 죽지않기 딱좋지않지 않다는 부분에 동의하지 않지 않다는점에서 매우 공감할수가 없을수가 없다고 생각하지 아니하지 아니합니다","이글을 본다면 당신에게 관리자 권한을 주지 않지아니한다는 부분에 저 박준서는 동의하지 않지않다는 점에서 매우 찬성하지 아니하면 저의 의견을 매우 지지하지 않는다는 모습을 본 저는 당신에게 관리자를 주고싶지 않지아니하지않습니다","다른이성에게 고백한다면 당신은","독서를 하면서 얻는 지식은 귀중하지만 야설을 읽으며 얻는 지식은 매우 귀중하지않지않을수가 없습니다","오늘 연상의 연인에게 고백한다면 당신은","오늘 연하의 연인에게 고백한다면 당신은","오늘 동성에거 고백한다면 69.74%확률로 까입니다!","열심히하는 벌꿀이되어서 온 우주의 도움을 받읍시다","금딸성공할거 같냐? 그냥 시원하게 포기해라ㅋㅋㄹㅃㅃ","샌즈ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ"]
      const Real = Random[Math.floor(Math.random()*Random.length) + 1]
     let img = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
      let user_name = message.author.username
      const Embed = new Discord.RichEmbed()
        .setFooter(user_name + "님의 오늘의 운세", img)
        .setTitle(Real)
    message.channel.send(Embed)


  } else if(message.content.startsWith('!주사위')) {
    let min = 1;
    let max = 6;
    let dice_num = parseInt(Math.random() * (max - min) + min);
    return message.reply(`${dice_num} 이(가) 나왔습니다.`);


  } else if(message.content == '!도움') {
      let helpImg = 'https://cdn.discordapp.com/avatars/733149844453195889/d29d770374b576cf541e3b0e5ea3abc3.png?size=128';
      let commandList = [
        {name: '!도움', desc: '도움!'},
        {name: '!코로나', desc: '코로나!'},
        {name: '!재난문자', desc: '최근 재난문자 3개를 보여줍니다!'},
        {name: '!날씨', desc: '오늘의 날씨 보기!'},
        {name: '!한강물온도', desc: '한강물의 온도 보기!'},
        {name: '!청소 (관리자)', desc: '텍스트 지우기!'},
        {name: '!오늘의 운세', desc: '오늘의 운세를 알려줍니다.'},
        {name: '!핑', desc: '봇의 핑을 알려줍니다.'},
        {name: '!역할추가 (관리자)', desc: '!역할추가 @이름 @역할 으로 역할을 추가합니다.'},
        {name: '봇에게 DM', desc: '봇의 버그나 문제가 있을시 봇에게 DM 보내면 됩니다.'},
        {name: '!정보', desc: '봇의 정보를 보여줍니다.'},
        {name: '!주사위', desc: '주사위를 굴려줍니다.'},
        {name: '!초대코드', desc: '까실서버 초대코드를 보내줍니다.'},
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


client.login(token);