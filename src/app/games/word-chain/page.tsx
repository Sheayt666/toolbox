"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "word-chain";
const GRID_SIZE = 5;
const GAME_DURATION = 60;
const BEST_SCORE_KEY = "gm_word_chain_best_score";

// Weighted letter bag (favors vowels and common consonants)
const LETTER_BAG =
  "AAAAAAAAAEEEEEEEEEEEEEEEIIIIIIIOOOOOOOOUUUUUURRRRRRRSSSSSSTTTTTTNNNNNNNLLLLLDDDDCCCMMMHHBBFFGGPPYYWWVJKXQZ";

// 200+ common English words (3-7 letters)
const WORD_LIST = new Set<string>([
  // 3-letter
  "act","add","age","ago","aid","aim","air","all","and","any","arc","arm","art","ash","ask","ate","axe","bad","bag","bar","bat","bay","bed","bee","beg","bet","big","bit","box","boy","bug","bus","but","buy","cab","can","cap","car","cat","cop","cot","cow","cry","cub","cup","cut","dad","day","den","did","die","dig","dim","dip","dog","dot","dry","due","dug","ear","eat","egg","elf","elk","elm","end","era","eve","eye","fan","far","fat","few","fig","fin","fir","fit","fix","fly","fog","for","fox","fry","fun","fur","gap","gas","gem","get","god","got","gum","gun","gut","guy","gym","had","ham","has","hat","hay","hen","her","hey","hid","him","hip","his","hit","hog","hop","hot","how","hub","hug","hut","ice","ill","ink","inn","ion","ire","its","jam","jar","jaw","jet","job","jog","joy","jug","key","kid","kin","kit","lab","lad","lag","lap","law","lay","led","leg","let","lid","lie","lip","lit","log","lot","low","mad","man","map","mar","may","men","met","mid","mix","mob","mom","mop","mud","mug","nag","nap","net","new","nil","nip","nod","nor","not","now","nut","oak","oar","odd","off","oil","old","one","opt","orb","ore","our","out","owl","own","pad","pal","pan","par","pat","paw","pay","pea","pen","pet","pie","pig","pin","pit","pod","pop","pot","pro","pry","pub","pug","pun","pup","put","rag","ram","ran","rap","rat","raw","ray","red","rib","rid","rig","rim","rip","rob","rod","rot","row","rub","rug","rum","run","sad","sag","sap","sat","saw","say","sea","see","set","sew","she","shy","sin","sip","sir","sit","six","ski","sky","sly","sob","son","sow","soy","spa","spy","sub","sum","sun","tab","tag","tan","tap","tar","tax","tea","ten","the","tie","tin","tip","toe","ton","too","top","toy","try","tub","tug","two","use","van","vat","vet","vex","via","vie","vow","wad","wag","war","was","wax","way","web","wed","wee","wet","who","why","wig","win","wit","woe","won","woo","yak","yam","yap","yea","yen","yep","yes","yet","you","zip","zoo",
  // 4-letter
  "able","acid","aged","also","area","army","away","baby","back","bake","bald","ball","band","bank","barn","base","bath","beam","bean","bear","beat","been","beer","bell","belt","bend","best","bike","bill","bird","bite","blue","boat","body","bold","bomb","bone","book","boom","boot","born","boss","both","bowl","brag","brew","buck","burn","bury","bush","busy","cage","cake","calf","call","calm","came","camp","cape","card","care","case","cash","cast","cave","cell","chap","chat","chef","chew","chip","chop","city","clam","clap","claw","clay","clip","clog","club","clue","coal","coat","code","coil","coin","cold","come","cook","cool","cope","copy","cord","core","cork","corn","cost","crab","cram","crew","crop","crow","cube","cure","curl","cute","dare","dark","dash","data","date","dawn","dead","deal","dean","dear","debt","deck","deed","deep","deer","demo","dent","deny","desk","dial","dice","died","diet","dirt","dish","disk","dive","dock","does","doll","done","door","dose","down","draw","drew","drop","drug","drum","dual","duck","duke","dull","dumb","dump","dust","duty","each","earn","ease","east","easy","edge","else","even","ever","evil","exit","face","fact","fade","fail","fair","fall","fame","fang","farm","fast","fate","fear","feat","feed","feel","feet","fell","felt","file","fill","film","find","fine","fire","firm","fish","five","flag","flat","flaw","flew","flow","foam","fold","folk","fond","font","food","fool","foot","fork","form","fort","four","free","from","fuel","full","fund","gain","game","gate","gave","gear","gene","gift","girl","give","glad","glow","goal","goat","goes","gold","golf","gone","good","gray","grew","grey","grid","grin","grip","grow","gulf","guru","half","hall","halt","hand","hang","hard","harm","hate","have","hawk","head","heal","heap","hear","heat","held","hell","help","here","hero","hide","high","hike","hill","hint","hire","hold","hole","holy","home","hood","hook","hope","horn","host","hour","huge","hung","hunt","hurt","icon","idea","idle","inch","into","iron","item","jail","jazz","jeep","join","joke","jump","june","jury","just","keen","keep","kept","kick","kill","kind","king","kiss","knee","knew","know","lack","lady","laid","lake","lamb","lamp","land","lane","last","late","lava","lawn","lazy","lead","leaf","leak","lean","leap","left","lend","less","lest","lick","lied","life","lift","like","limb","lime","line","link","lion","list","live","load","loan","lock","logo","lone","long","look","loop","lord","lose","loss","lost","loud","love","luck","made","mail","main","make","male","mall","many","mark","mask","mass","mate","math","maze","meal","mean","meat","meet","melt","menu","mere","mess","mice","mild","mile","milk","mill","mind","mine","mint","miss","mode","mood","moon","more","most","move","much","must","myth","nail","name","navy","near","neat","neck","need","nest","news","next","nice","nine","node","none","noon","nose","note","noun","oath","obey","odds","okay","once","only","onto","open","oral","over","pace","pack","page","paid","pain","pair","palm","park","part","pass","past","path","peak","peal","pear","peel","peer","perk","pest","pick","pier","pile","pill","pine","pink","pipe","plan","play","plea","plot","plug","plus","poem","poet","pole","poll","pond","pool","poor","pope","pork","port","pose","post","pour","pray","prep","prey","prod","prom","prop","puff","pull","pump","punk","pure","push","quit","quiz","race","rack","rage","raid","rail","rain","rake","ramp","rank","rare","rate","read","real","ream","reap","rear","reef","reel","rely","rent","rest","rich","ride","ring","rink","riot","ripe","rise","risk","road","roam","roar","robe","rock","rode","role","roll","roof","room","root","rope","rose","ruby","rude","ruin","rule","rung","runt","rush","rust","sack","safe","sage","said","sail","sake","sale","salt","same","sand","sang","sank","save","scan","scar","seal","seat","seed","seek","seem","seen","self","sell","send","sent","ship","shoe","shop","shot","show","shut","sick","side","sign","silk","sing","sink","site","size","skin","skip","slam","slap","sled","slew","slid","slim","slip","slit","slop","slot","slow","slug","slum","snap","snob","snow","soak","soap","sock","soda","sofa","soft","soil","sold","sole","solo","some","song","soon","sore","sort","soul","soup","sour","spam","span","spar","spin","spit","spot","spry","spun","spur","stab","star","stay","stem","step","stew","stir","stop","stub","stud","stun","such","suit","sulk","sung","sunk","sure","surf","swam","swan","swap","swat","swim","tack","tail","take","tale","talk","tall","tame","tank","tape","task","team","tear","teen","tell","temp","tend","tent","term","test","text","than","that","them","then","they","thin","this","thud","thug","thus","tide","tied","tier","tile","till","tilt","time","tiny","tire","toad","toil","told","toll","tomb","tome","tone","took","tool","torn","toss","tour","town","trap","tray","tree","trim","trio","trip","trod","true","tube","tuck","tuft","tuna","tune","turn","twin","type","ugly","undo","unit","upon","urge","used","user","vain","vary","vase","vast","veil","vein","very","veto","vibe","vice","view","vile","vine","void","vote","wade","wage","wail","wait","wake","walk","wall","wand","wane","want","ward","ware","warm","warn","warp","wash","wasp","wave","weak","wear","weed","week","well","went","were","west","what","when","whip","whom","wide","wife","wild","will","wind","wine","wing","wink","wipe","wire","wise","wish","with","wolf","wood","wool","word","wore","work","worm","worn","wove","wrap","yard","yarn","yawn","yeah","year","yell","yoga","your","zero","zone",
  // 5-letter
  "about","above","abuse","actor","acute","admit","adopt","adult","after","again","agent","agree","ahead","alarm","album","alert","alien","align","alike","alive","allow","alone","along","alter","among","anger","angle","angry","apart","apple","apply","arena","argue","arise","armor","array","arrow","aside","asset","audio","audit","avoid","award","aware","badly","baker","basic","basis","beach","began","begin","begun","being","below","bench","birth","black","blade","blame","blank","blast","blend","bless","blind","block","blood","bloom","board","boast","bonus","boost","booth","bound","brain","brand","brass","brave","bread","break","breed","brick","brief","bring","broad","broke","brown","brush","build","built","burst","buyer","cable","candy","carry","catch","cause","cease","chain","chair","chaos","charm","chart","chase","cheap","cheat","check","chess","chest","chief","child","chill","china","civic","civil","claim","class","clean","clear","click","cliff","climb","clock","close","cloth","cloud","clown","coach","coast","color","comic","coral","count","court","cover","craft","crash","crazy","cream","crime","crisp","cross","crowd","crown","crude","curve","cycle","daily","dairy","dance","dealt","death","delay","depth","derby","devil","diary","dirty","ditch","diver","dizzy","dodge","donor","dough","doubt","dozen","draft","drain","drama","drank","drawn","dread","dream","dress","dried","drift","drill","drink","drive","drove","drown","drunk","eager","eagle","early","earth","eaten","eight","elbow","elder","elect","elite","email","empty","enact","ended","enemy","enjoy","enter","entry","equal","error","essay","event","every","exact","exile","exist","extra","fable","faced","faith","false","fancy","fatal","fault","feast","fence","fewer","fiber","field","fifth","fifty","fight","final","first","flame","flash","flask","fleet","flesh","flick","fling","flint","floor","flora","flour","flown","fluid","flush","focus","force","forge","forty","forum","found","frame","fraud","fresh","fried","front","frost","fruit","fully","funny","gamer","gauge","giant","given","glass","globe","gloom","glory","gloss","glove","going","grade","grain","grand","grant","grape","graph","grasp","grass","grave","great","greed","green","greet","grief","grill","grind","gross","group","grown","guard","guess","guest","guide","guilt","habit","happy","harsh","haste","haven","heart","heavy","hedge","hello","hence","hobby","honey","horse","hotel","house","human","humor","hurry","ideal","idiom","image","imply","index","inner","input","intro","irony","issue","ivory","jeans","jelly","jewel","joint","joker","judge","juice","jumbo","jumpy","kayak","kneel","knelt","knife","knock","known","label","labor","large","laser","later","laugh","layer","learn","lease","least","leave","ledge","legal","lemon","level","lever","light","liked","liner","liter","lived","liver","lobby","local","lodge","logic","loose","lower","loyal","lucky","lunch","lying","macro","magic","major","maker","manga","manor","march","marsh","match","maybe","mayor","meant","medal","media","melon","merit","merry","metal","meter","midst","might","minor","mixed","model","modem","money","month","moose","moral","motor","mount","mouse","mouth","movie","mower","music","naive","nasty","never","newer","newly","night","ninth","noble","noise","north","noted","novel","nurse","nylon","ocean","offer","often","olive","onion","opera","order","organ","other","ought","outer","owner","ozone","paint","panel","panic","paper","party","patch","pause","peace","peach","pearl","penny","perch","petal","phase","phone","photo","piano","piece","pilot","pinch","pitch","pixel","pizza","place","plain","plane","plank","plant","plate","plaza","plead","point","poker","polar","porch","pound","power","press","price","pride","prime","print","prior","prize","probe","prone","proof","proud","prove","proxy","psalm","pulse","punch","pupil","puppy","purse","queen","query","quest","queue","quick","quiet","quill","quilt","quite","quota","quote","racer","radar","radio","rainy","raise","rally","ranch","range","rapid","ratio","raven","reach","react","ready","realm","rebel","refer","reign","relax","relay","renew","repay","reply","reset","retro","rhyme","rider","ridge","rifle","right","rigid","rinse","ripen","rival","river","robot","rocky","roman","rough","round","route","royal","rugby","ruler","rural","saber","saint","salad","salon","salsa","sandy","satin","sauce","sauna","saved","saver","scale","scalp","scarf","scary","scene","scent","scoop","scope","score","scout","scrap","scrub","sedan","seize","sense","seven","sever","shade","shaft","shake","shaky","shall","shame","shape","share","shark","sharp","shave","sheep","sheer","sheet","shelf","shell","shift","shine","shiny","shirt","shock","shoes","shoot","shore","short","shout","shown","shred","shrub","shrug","sigma","silly","since","siren","sixth","sixty","sized","skate","skier","skill","skirt","skull","slack","slain","slang","slant","slash","slate","slave","sleek","sleep","sleet","slept","slice","slick","slide","slime","sling","slink","slope","sloth","slump","slung","slurp","slush","small","smart","smash","smear","smell","smile","smirk","smith","smoke","smoky","snack","snail","snake","snare","snarl","sneak","sneer","sniff","snipe","snore","snort","snout","snowy","snuck","soapy","sober","soggy","solar","solid","solve","sonar","sonic","sorry","sound","south","space","spade","spare","spark","spawn","speak","spear","speck","speed","spell","spend","spent","spice","spicy","spike","spiky","spill","spine","spiny","spite","split","spoil","spoke","spool","spoon","sport","spout","spray","spree","squad","squat","stack","staff","stage","stain","stair","stake","stale","stalk","stall","stamp","stand","stank","stare","stark","start","stash","state","stead","steak","steal","steam","steed","steel","steep","steer","stern","stick","stiff","still","stilt","sting","stink","stint","stoic","stoke","stole","stomp","stone","stony","stood","stool","stoop","store","stork","storm","story","stout","stove","strap","straw","stray","strip","strut","stuck","study","stuff","stump","stung","stunt","style","suave","sugar","suite","sunny","super","surge","surly","sushi","swamp","swarm","sweat","sweep","sweet","swell","swept","swift","swine","swing","swipe","swirl","swish","sword","swore","sworn","swung","syrup","table","taboo","tacit","tacks","tacky","tails","taint","taken","taker","talks","tally","talon","tamed","tamer","tango","tangy","tanks","taper","tapir","tardy","tarot","tarps","tarry","tarts","taste","tasty","taunt","tawny","taxes","teach","teams","teary","tease","teddy","teens","teeny","teeth","tempo","tempt","tends","tenet","tenor","tense","tenth","tepee","tepid","terms","terra","terse","tests","testy","thank","theft","their","theme","there","these","thick","thief","thigh","thine","thing","think","third","thong","thorn","those","thumb","thump","thyme","tiara","ticks","tidal","tides","tiger","tight","tilde","tiled","tilts","timed","timer","times","tinge","tipsy","tired","tires","titan","tithe","title","toads","toast","today","toddy","togas","toils","token","tolls","tombs","tomes","tonal","toned","toner","tones","tongs","tonic","tooth","topaz","topic","torch","torso","torus","total","totem","touch","tough","tours","touts","towed","towel","tower","towns","toxic","toxin","toyed","trace","track","tract","trade","trail","train","trait","tramp","trans","traps","trash","trawl","trays","tread","treat","trend","tress","trial","tribe","trice","trick","tried","trier","tries","trike","trill","trims","trios","tripe","trips","trite","troll","troop","trope","trout","trove","truce","truck","truer","truly","trump","trunk","truss","trust","truth","tryst","tubas","tubed","tuber","tubes","tucks","tufts","tulip","tulle","tummy","tumor","tuned","tuner","tunes","tunic","turbo","turfs","turns","tusks","tutor","twain","twang","tweak","tweed","tweet","twice","twine","twins","twirl","twist","twixt","tying","types","udder","ulcer","ultra","umbra","uncle","under","undid","undue","unfed","unfit","unify","union","unite","unity","unlit","unmet","unset","untie","until","unwed","unzip","upend","upset","urban","urged","urine","usage","users","usher","using","usual","usurp","utile","utter","vague","valet","valid","valor","value","valve","vapid","vapor","vault","vaunt","venom","verge","verse","verso","vests","vexed","vicar","video","views","vigil","vigor","villa","vines","vinyl","viola","viper","viral","virus","vista","vital","vivid","vixen","vocal","vodka","vogue","voice","voila","voted","voter","votes","vouch","vowed","vowel","vying","wacky","waded","wader","wades","wafer","wafts","waged","wager","wages","wagon","waifs","wails","waist","waits","waive","waked","waken","wakes","walks","walls","waltz","wands","waned","wanes","wanly","wants","wards","wares","warms","warns","warps","warts","washy","wasps","waste","watch","water","watts","waved","waver","waves","waxed","waxen","waxes","weans","wears","weary","weave","wedge","weeds","weedy","weeks","weeny","weeps","weepy","weigh","weird","welch","welds","wells","welsh","welts","wench","wends","whack","whale","wharf","wheat","wheel","whelk","whelp","where","which","whiff","while","whims","whine","whiny","whips","whirl","whirr","whisk","white","whizz","whole","whoop","whose","wicks","widen","wider","wides","width","wield","wight","wilds","wiled","wiles","wills","wilts","wimps","wimpy","wince","winch","winds","windy","wined","wines","wings","winks","wiped","wiper","wipes","wired","wirer","wires","wiser","wises","wisps","wispy","witch","withe","witty","wives","woken","woman","wombs","women","woods","woody","woofs","wools","wooly","woozy","words","wordy","works","world","worms","wormy","worry","worse","worst","worth","would","wound","woven","wraps","wrath","wreak","wreck","wrens","wring","wrist","write","writs","wrong","wrote","wroth","wrung","wryly","xenon","yacht","yacks","yanks","yards","yarns","yawls","yawns","yearn","years","yeast","yells","yelps","yetis","yield","yipes","yodel","yogas","yogic","yogis","yoked","yokel","yokes","yolks","yolky","young","yours","youth","yowls","yucca","yummy","yurts","zebra","zeros","zests","zesty","zilch","zincs","zingy","zippy","zonal","zoned","zones","zooms",
  // 6-letter
  "accept","across","acting","action","active","actual","advice","advise","affect","afford","afraid","agency","agenda","almost","always","amount","animal","annual","answer","anyone","anyway","appeal","appear","around","arrive","artist","aspect","assess","assist","assume","attack","attend","august","author","avenue","backed","barely","barrel","basket","battle","beauty","became","become","before","behalf","behind","belief","belong","berlin","better","beyond","bishop","bodies","border","bottle","bottom","bought","branch","breath","bridge","bright","broken","budget","burden","bureau","button","camera","cancer","cannot","carbon","career","castle","casual","caught","center","centre","chance","change","charge","choice","choose","chosen","church","circle","client","closed","closer","coffee","colour","coming","common","comply","copper","corner","costly","county","couple","course","covers","create","credit","crisis","custom","danger","dating","debate","decade","decide","deeply","defeat","defend","define","degree","demand","depend","deputy","desert","design","desire","detail","detect","device","differ","dinner","direct","doctor","dollar","domain","double","driven","driver","during","easily","eating","editor","effect","effort","either","eleven","emerge","empire","employ","enable","ending","energy","engage","engine","enough","ensure","entire","entity","equity","escape","estate","ethnic","exceed","except","excess","expand","expect","expert","export","extend","extent","fabric","facing","factor","failed","fairly","fallen","family","famous","father","fellow","female","figure","filing","finger","finish","fiscal","flight","flying","follow","forced","forest","forget","formal","format","former","foster","fought","fourth","french","friend","future","garden","gather","gender","german","global","golden","ground","growth","guilty","handed","handle","happen","hardly","health","height","hidden","holder","honest","hoping","ignore","impact","import","income","indeed","injury","inside","intend","intent","invest","island","itself","junior","kidney","killed","latest","latter","launch","lawyer","leader","league","length","lesson","letter","likely","linked","liquid","listen","little","living","losing","lovely","mainly","making","manage","manner","manual","margin","marine","master","matter","mature","medium","member","memory","mental","merely","method","middle","minute","mirror","modern","module","moment","mostly","mother","motion","moving","murder","museum","mutual","myself","narrow","nation","native","nature","nearby","nearly","normal","notice","notion","number","object","obtain","occupy","offset","online","option","orange","origin","output","packed","palace","parent","partly","patent","people","period","permit","person","phrase","picked","planet","played","player","please","plenty","pocket","police","policy","polish","prefer","pretty","prince","prison","profit","proper","proven","public","pulled","purely","pursue","raised","random","rarely","rather","rating","reader","really","reason","recall","recent","record","reduce","reform","refuse","regard","regime","region","relate","relief","remain","remark","remind","remote","remove","repair","repeat","report","rescue","resist","resort","result","resume","retail","retain","return","reveal","review","reward","riding","rising","robust","safety","salary","sample","saving","saying","school","screen","search","season","second","secret","sector","secure","seeing","select","seller","senior","series","server","settle","severe","sexual","should","shower","signal","signed","silent","silver","simple","simply","single","sister","slight","slowly","smooth","social","soccer","sodium","softly","solely","solved","sought","source","spirit","spoken","spread","spring","square","stable","strict","strike","string","strong","struck","studio","stupid","submit","subtle","sudden","suffer","summer","summit","supply","surely","survey","switch","symbol","system","taking","talent","target","taught","temple","tender","tennis","thanks","theory","thirty","though","thread","threat","thrown","thrust","tissue","toilet","tomato","tongue","topped","toward","travel","treaty","troops","trying","twelve","twenty","unable","unique","united","unless","unlike","update","useful","valley","vendor","versus","victim","vision","visual","volume","walker","wealth","weekly","weight","wholly","window","winter","wisdom","within","wonder","wooden","worker","writer","yellow",
  // 7-letter
  "ability","absence","academy","account","accused","achieve","acquire","address","advance","adviser","against","airline","airport","alcohol","alleged","allowed","ancient","another","anxiety","anybody","appoint","approve","arrange","arrival","article","artwork","athlete","attempt","attract","auction","average","awarded","balance","barrier","battery","bearing","beating","because","bedroom","believe","beneath","benefit","between","billion","binding","brother","browser","brought","cabinet","capable","capital","captain","capture","careful","carrier","casting","ceiling","central","century","certain","chamber","channel","chapter","charity","charter","chicken","circuit","classic","climate","closely","closing","cluster","collect","college","combine","comfort","command","comment","company","compare","compete","complex","concept","concern","concert","conduct","confirm","connect","consent","consist","contact","contain","content","contest","context","control","convert","convict","cooking","cottage","council","counsel","country","courage","crystal","culture","curious","current","cutting","debated","decided","decline","default","defense","deficit","deliver","density","deposit","despite","destroy","develop","diamond","discuss","disease","display","distant","diverse","divided","drawing","dressed","driving","dropped","eastern","economy","edition","elderly","element","emperor","empower","endless","engaged","english","enhance","enlarge","equally","evening","examine","example","excited","exclude","execute","exhibit","explain","explore","express","extends","extreme","factory","faculty","falling","fashion","feature","federal","feeling","fifteen","finally","finance","finding","fishing","fitness","foreign","forever","formula","fortune","forward","founded","freedom","further","gallery","gateway","general","genuine","gesture","getting","greater","growing","habitat","handful","hanging","happily","harvest","healthy","hearing","heating","helpful","highway","holding","holiday","hostile","housing","however","hundred","hunting","husband","imagine","improve","include","inquiry","insight","install","instant","instead","intense","involve","italian","jewelry","judging","kitchen","knowing","largely","lasting","leading","leather","leaving","lending","liberal","liberty","library","licence","lighter","limited","listing","loading","logical","longest","looking","machine","manager","mankind","married","massive","matters","maximum","meaning","measure","medical","meeting","mention","midwest","minimum","mission","mixture","monitor","monthly","morning","musical","mystery","natural","neither","nervous","network","neutral","nothing","nuclear","nursery","obvious","offense","officer","ongoing","opening","operate","opinion","optical","organic","outcome","outdoor","outlook","outside","overall","package","painful","painter","parking","partial","partner","passage","passing","passion","patient","pattern","payment","pending","pension","perfect","perform","perhaps","picture","plastic","pointed","popular","portion","possess","possible","pottery","poverty","practise","precise","predict","premier","prepare","present","prevent","primary","printer","privacy","private","problem","proceed","process","produce","product","profile","program","project","promise","promote","protect","protein","protest","provide","publish","purpose","pursuit","pushing","quality","quantum","quarter","quickly","quietly","racing","radical","raining","reading","realize","reality","rebuild","receive","recover","reflect","refused","regards","related","release","relieve","remains","removal","renewal","replace","replied","request","require","rescue","reserve","respect","respond","restore","retired","revenue","reverse","reviews","rewards","running","satisfy","savings","scholar","science","scratch","section","segment","seldom","senate","sending","serious","servant","serving","session","settled","seventh","several","sharing","shelter","shipping","showing","silence","silicon","similar","sitting","sixteen","skilled","slavery","society","someone","speaker","special","species","specify","speech","sponsor","stadium","station","stayed","stepped","stomach","stopped","storage","strange","strategy","stretch","student","studied","studies","subject","succeed","success","suggest","support","suppose","supreme","surface","surgery","surplus","survive","suspect","sustain","swallow","sweater","symbol","tactics","talent","tearing","teenage","telling","tending","terminal","terrain","testing","theater","therapy","thereby","thinker","thought","through","throwing","tighter","tobacco","together","tonight","torture","touched","towards","trader","traffic","trained","transit","trapped","travels","treated","trials","tricky","trouble","trusted","tuition","twisted","unaware","uniform","unknown","unlike","unusual","upgrade","urgent","useful","utility","vacancy","variety","various","venture","version","veteran","victory","village","vintage","violent","virtual","visited","visitor","voiced","voltage","volumes","voting","voucher","voyage","waiting","walker","wanting","warning","washed","wasting","watched","watered","wearing","weather","weaving","wedding","weekday","weekend","weighed","welcome","welfare","western","wherever","whisper","whistle","wicked","willing","winding","winning","wisdom","wisely","witness","wonder","working","worried","worship","writing","written","yielded","younger","yourself",
]);

// Seeded PRNG for daily mode
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function randomLetter(rng: () => number = Math.random): string {
  return LETTER_BAG[Math.floor(rng() * LETTER_BAG.length)];
}

function makeGrid(rng: () => number = Math.random): string[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => randomLetter(rng)),
  );
}

function isAdjacent(a: { row: number; col: number }, b: { row: number; col: number }): boolean {
  return Math.abs(a.row - b.row) <= 1 && Math.abs(a.col - b.col) <= 1 && !(a.row === b.row && a.col === b.col);
}

function pathToWord(grid: string[][], path: { row: number; col: number }[]): string {
  return path.map((p) => grid[p.row][p.col]).join("").toLowerCase();
}

function scoreForWord(word: string): number {
  const len = word.length;
  if (len < 3) return 0;
  const base = { 3: 10, 4: 25, 5: 50, 6: 100, 7: 200, 8: 400 } as Record<number, number>;
  return base[len] ?? 400;
}

type GameState = "idle" | "playing" | "paused" | "over";

export default function WordChainPage() {
  const [mounted, setMounted] = useState(false);
  const [grid, setGrid] = useState<string[][]>(() => makeGrid());
  const [path, setPath] = useState<{ row: number; col: number }[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [longestWord, setLongestWord] = useState("");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [mode, setMode] = useState<"random" | "daily">("random");
  const [lastWord, setLastWord] = useState("");
  const [invalidFlash, setInvalidFlash] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [scorePopups, setScorePopups] = useState<{ id: number; value: number; combo: number }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);

  const gridRef = useRef<string[][]>(grid);
  const pathRef = useRef<{ row: number; col: number }[]>([]);
  const isDraggingRef = useRef(false);
  const gameStateRef = useRef<GameState>("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const submittedRef = useRef(false);
  const popupIdRef = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = parseInt(localStorage.getItem(BEST_SCORE_KEY) || "0", 10) || 0;
      if (saved > 0) setBestScore(saved);
    } catch { /* ignore */ }
    const rng = mulberry32(getDailySeed());
    const dg = makeGrid(rng);
    gridRef.current = dg;
    setGrid(dg);
  }, []);

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { pathRef.current = path; }, [path]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const triggerPopup = useCallback((value: number, comboNum: number) => {
    const id = popupIdRef.current++;
    setScorePopups((prev) => [...prev, { id, value, combo: comboNum }]);
    timersRef.current.push(setTimeout(() => {
      setScorePopups((prev) => prev.filter((p) => p.id !== id));
    }, 1000));
  }, []);

  const finish = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    submitScore(GAME_ID, scoreRef.current);
    setRefreshKey((k) => k + 1);
    if (scoreRef.current > bestScore) {
      setBestScore(scoreRef.current);
      try { localStorage.setItem(BEST_SCORE_KEY, String(scoreRef.current)); } catch { /* ignore */ }
    }
  }, [bestScore]);

  const startGame = useCallback((selectedMode: "random" | "daily") => {
    const rng = selectedMode === "daily" ? mulberry32(getDailySeed()) : Math.random;
    const g = makeGrid(rng);
    gridRef.current = g;
    setGrid(g);
    scoreRef.current = 0;
    setScore(0);
    setCombo(0);
    setWordCount(0);
    setLongestWord("");
    setTimeLeft(GAME_DURATION);
    setPath([]);
    setFoundWords([]);
    setLastWord("");
    setInvalidFlash(false);
    submittedRef.current = false;
    setMode(selectedMode);
    setGameState("playing");

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameState("over");
          finish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [finish]);

  const pauseGame = useCallback(() => {
    if (gameStateRef.current !== "playing") return;
    setGameState("paused");
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const resumeGame = useCallback(() => {
    if (gameStateRef.current !== "paused") return;
    setGameState("playing");
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameState("over");
          finish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [finish]);

  const submitWord = useCallback(() => {
    if (gameStateRef.current !== "playing") return;
    const currentPath = pathRef.current;
    if (currentPath.length < 3) {
      setPath([]);
      return;
    }
    const word = pathToWord(gridRef.current, currentPath);
    if (WORD_LIST.has(word) && !foundWords.includes(word)) {
      const base = scoreForWord(word);
      const newCombo = combo + 1;
      const multiplier = Math.min(newCombo, 5);
      const gained = base * multiplier;
      scoreRef.current += gained;
      setScore(scoreRef.current);
      setCombo(newCombo);
      setWordCount((c) => c + 1);
      setFoundWords((prev) => [word, ...prev]);
      setLastWord(word);
      if (word.length > longestWord.length) setLongestWord(word);
      triggerPopup(gained, multiplier);

      // Replace used letters with new ones
      const newGrid = gridRef.current.map((r) => r.slice());
      const rng = mode === "daily" ? mulberry32(getDailySeed() + Date.now()) : Math.random;
      for (const p of currentPath) {
        newGrid[p.row][p.col] = randomLetter(rng);
      }
      gridRef.current = newGrid;
      setGrid(newGrid);
    } else {
      setCombo(0);
      setInvalidFlash(true);
      timersRef.current.push(setTimeout(() => setInvalidFlash(false), 400));
    }
    setPath([]);
  }, [combo, longestWord, mode, triggerPopup, foundWords]);

  // Pointer handlers for cell selection
  const startCell = useCallback((row: number, col: number) => {
    if (gameStateRef.current !== "playing") return;
    isDraggingRef.current = true;
    setPath([{ row, col }]);
  }, []);

  const enterCell = useCallback((row: number, col: number) => {
    if (!isDraggingRef.current || gameStateRef.current !== "playing") return;
    const currentPath = pathRef.current;
    const idx = currentPath.findIndex((p) => p.row === row && p.col === col);
    if (idx >= 0) {
      // Backtrack: if this is the second-to-last cell, remove the last
      if (idx === currentPath.length - 2) {
        setPath(currentPath.slice(0, -1));
      }
      return;
    }
    const last = currentPath[currentPath.length - 1];
    if (last && isAdjacent(last, { row, col })) {
      setPath([...currentPath, { row, col }]);
    }
  }, []);

  const endDrag = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    submitWord();
  }, [submitWord]);

  // Global mouseup listener
  useEffect(() => {
    const onUp = () => endDrag();
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchcancel", onUp);
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("touchcancel", onUp);
    };
  }, [endDrag]);

  // Touch move handler for the grid
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
    if (el) {
      const row = parseInt(el.dataset.row || "-1", 10);
      const col = parseInt(el.dataset.col || "-1", 10);
      if (row >= 0 && col >= 0) enterCell(row, col);
    }
  }, [enterCell]);

  // Keyboard: P to pause
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "p") {
        e.preventDefault();
        if (gameStateRef.current === "playing") pauseGame();
        else if (gameStateRef.current === "paused") resumeGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pauseGame, resumeGame]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const isInPath = (row: number, col: number) =>
    path.some((p) => p.row === row && p.col === col);

  const pathIndex = (row: number, col: number) =>
    path.findIndex((p) => p.row === row && p.col === col);

  const stats: GameStat[] = [
    { label: "分数", value: score, icon: "⭐" },
    { label: "单词数", value: wordCount, icon: "📝" },
    { label: "最长单词", value: longestWord || "—", icon: "📏" },
    { label: "最高分", value: bestScore, icon: "🏆" },
  ];

  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="文字接龙"
        iconEmoji="🔤"
        iconGradient="from-purple-500 to-pink-500"
        stats={[{ label: "分数", value: 0 }, { label: "单词数", value: 0 }, { label: "最长单词", value: "—" }, { label: "最高分", value: 0 }]}
        shareScore={0}
        refreshKey={0}
      >
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  const currentWord = path.length > 0 ? pathToWord(grid, path).toUpperCase() : "";
  const timerColor = timeLeft <= 10 ? "bg-red-500" : timeLeft <= 20 ? "bg-orange-500" : "bg-purple-500";

  return (
    <GameShell
      gameId={GAME_ID}
      title="文字接龙"
      iconEmoji="🔤"
      iconGradient="from-purple-500 to-pink-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center p-4 sm:p-6">
        {/* Timer bar */}
        <div className="w-full max-w-md mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">
              {mode === "daily" ? "每日挑战" : "随机模式"} · 连击 x{Math.min(combo + (gameState === "playing" && path.length >= 3 ? 1 : 0), 5)}
            </span>
            <span className={`text-sm font-bold ${timeLeft <= 10 ? "text-red-400" : "text-gray-300"}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
            <div
              className={`h-full ${timerColor} transition-all duration-1000 ease-linear`}
              style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
            />
          </div>
        </div>

        {/* Current word display */}
        <div className="h-8 mb-2 flex items-center gap-2">
          {scorePopups.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none animate-bounce text-lg font-bold text-green-400"
              style={{ transform: "translateY(-20px)" }}
            >
              +{p.value}{p.combo > 1 ? ` x${p.combo}` : ""}
            </div>
          ))}
          {currentWord && (
            <span className={`text-lg font-bold ${WORD_LIST.has(currentWord.toLowerCase()) && !foundWords.includes(currentWord.toLowerCase()) ? "text-green-400" : "text-gray-400"}`}>
              {currentWord}
            </span>
          )}
          {lastWord && !currentWord && (
            <span className="text-sm text-gray-500">上一个: {lastWord.toUpperCase()}</span>
          )}
        </div>

        {/* Letter grid */}
        <div className="relative" onTouchMove={onTouchMove}>
          <div
            className={`grid grid-cols-5 gap-1.5 sm:gap-2 p-3 rounded-2xl border transition-colors ${invalidFlash ? "border-red-500" : "border-gray-700"} bg-gray-900/60`}
            style={{ touchAction: "none" }}
          >
            {grid.map((row, ri) =>
              row.map((letter, ci) => {
                const selected = isInPath(ri, ci);
                const idx = pathIndex(ri, ci);
                return (
                  <button
                    key={`${ri}-${ci}`}
                    data-row={ri}
                    data-col={ci}
                    onMouseDown={(e) => { e.preventDefault(); startCell(ri, ci); }}
                    onMouseEnter={() => enterCell(ri, ci)}
                    aria-label={`字母 ${letter} 第${ri + 1}行第${ci + 1}列`}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold select-none transition-all duration-100 ${
                      selected
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-110 shadow-lg shadow-purple-500/50"
                        : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    }`}
                    style={{ touchAction: "none" }}
                  >
                    {letter}
                    {selected && idx >= 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-purple-600 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                    )}
                  </button>
                );
              }),
            )}
          </div>

          {/* SVG overlay for connection lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {path.length > 1 &&
              path.slice(0, -1).map((p, i) => {
                const next = path[i + 1];
                const x1 = ((p.col + 0.5) / GRID_SIZE) * 100;
                const y1 = ((p.row + 0.5) / GRID_SIZE) * 100;
                const x2 = ((next.col + 0.5) / GRID_SIZE) * 100;
                const y2 = ((next.row + 0.5) / GRID_SIZE) * 100;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(168,85,247,0.6)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
          </svg>

          {/* Idle overlay */}
          {gameState === "idle" && (
            <div className="absolute inset-0 rounded-2xl bg-gray-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
              <div className="text-5xl">🔤</div>
              <h3 className="text-2xl font-bold text-white">文字接龙</h3>
              <p className="text-sm text-gray-400 text-center max-w-xs px-4">
                拖拽连接相邻字母组成英文单词（至少3个字母）。连击越多得分翻倍！
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => startGame("random")}
                  aria-label="开始随机模式"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors shadow-lg shadow-purple-600/30"
                >
                  随机模式 · 60秒挑战
                </button>
                <button
                  onClick={() => startGame("daily")}
                  aria-label="开始每日挑战"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 text-sm font-medium text-purple-200 bg-purple-900/50 hover:bg-purple-800/50 rounded-xl transition-colors border border-purple-700"
                >
                  每日挑战 · 固定布局
                </button>
              </div>
            </div>
          )}

          {/* Paused overlay */}
          {gameState === "paused" && (
            <div className="absolute inset-0 rounded-2xl bg-gray-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-4">
              <div className="text-4xl">⏸️</div>
              <h3 className="text-xl font-bold text-white">已暂停</h3>
              <div className="flex gap-3">
                <button
                  onClick={resumeGame}
                  aria-label="继续游戏"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
                >
                  继续 (P)
                </button>
                <button
                  onClick={() => startGame(mode)}
                  aria-label="重新开始"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                >
                  重新开始
                </button>
              </div>
            </div>
          )}

          {/* Game over overlay */}
          {gameState === "over" && (
            <div className="absolute inset-0 rounded-2xl bg-gray-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-2 p-4 text-center">
              <div className="text-5xl mb-2">🎉</div>
              <h3 className="text-2xl font-bold text-white">时间到！</h3>
              <p className="text-sm text-gray-400">最终分数</p>
              <p className="text-4xl font-bold text-purple-400">{score}</p>
              <p className="text-xs text-gray-500">
                {score >= bestScore ? "新纪录！" : `最高分: ${bestScore}`}
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <div><span className="text-gray-500">单词:</span> <span className="text-gray-300 font-bold">{wordCount}</span></div>
                <div><span className="text-gray-500">最长:</span> <span className="text-gray-300 font-bold">{longestWord || "—"}</span></div>
              </div>
              <button
                onClick={() => startGame(mode)}
                aria-label="再来一局"
                className="mt-4 inline-flex items-center justify-center min-h-[44px] px-6 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors shadow-lg shadow-purple-600/30"
              >
                再来一局
              </button>
            </div>
          )}
        </div>

        {/* Found words list */}
        {foundWords.length > 0 && (
          <div className="mt-4 w-full max-w-md">
            <div className="flex flex-wrap gap-1.5 justify-center">
              {foundWords.slice(0, 12).map((w, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-purple-900/40 text-purple-300 text-xs font-medium border border-purple-800/50"
                >
                  {w.toUpperCase()}
                </span>
              ))}
              {foundWords.length > 12 && (
                <span className="px-2.5 py-1 text-gray-500 text-xs">+{foundWords.length - 12}</span>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        {gameState === "playing" && (
          <button
            onClick={pauseGame}
            aria-label="暂停游戏"
            className="mt-4 inline-flex items-center justify-center min-h-[44px] px-5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors border border-gray-700"
          >
            暂停 (P)
          </button>
        )}

        {/* Instructions */}
        <p className="mt-4 text-xs text-gray-500 text-center max-w-md">
          拖拽或滑动连接相邻字母（含对角线）组成英文单词。3字母=10分，4字母=25分，5字母=50分，6字母=100分，7字母=200分。连击翻倍最高5倍！
        </p>
      </div>
    </GameShell>
  );
}
