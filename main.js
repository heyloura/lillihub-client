import * as mb from "./scripts/server/mb.js";
import * as utility from "./scripts/server/utilities.js";

/******************************************************************************************************************
* README
*
* Creating an APP_SECRET environmental variable. Save the rawKey.
*      const key = await crypto.subtle.generateKey({ name: "AES-CBC", length: 128 },true,["encrypt", "decrypt"]);
*      const rawKey = JSON.stringify(await crypto.subtle.exportKey("jwk", key));
******************************************************************************************************************/
//const _appSecret = JSON.parse(Deno.env.get("APP_SECRET") ?? "{}");
//const _lillihubToken = Deno.env.get("APP_LILLIHUB_MTOKEN") ?? "";
//const deployURL = 'https://sad-bee-43--version3.deno.dev/';
const _development = true;

const _appSecret = JSON.parse('{"kty":"oct","k":"c2V4g-FQSxzpeCE8E0JcMg","alg":"A128CBC","key_ops":["encrypt","decrypt"],"ext":true}');
const deployURL = 'http://localhost:8000/';
const _mbLiliihubToken = 'BF4E914933A50A2A286B';
const noMore = ["Theindex","jefbrr","tomc","Fiftyfootshadows","jbrosi","toomanypelikans","adrian","cagrimmett","motz","jellisatc","kleinheld","jweath","ipadcollective","gene","AV8RDude","abbey","rosefox","bkryer","o365ninjas","esjewett","Andelirich","jarelion","nickwynja","cjeller","ymar","martinfeld","RobinH","miyagawa","ddykstal","seanoliver","pmarsceill","jcburns","ccorrea","WeNeedAnArk","chiawase","johnmarino","mmn","t","luca","jtr","maxvoltar","swrogers","ulysse","Iquitoz","jamiemchale","otter","pyrmont","richnewman","bondad","dgreene196","cmetzendorf","thebaer","chartier","larand","Seanpkelley","SteveSawczyn","whlteXbread","i3xCx","mikehay","carleton","devinprater","lzbth","jlord","SuperMoof","thesuku","jsnell","drose","wasimparkar","arw","ParasiteHouse","wnknisely","isaiah","FlagrantError","tockrock","film_girl","hashtag","mistercharlie","chads","strandlines","swcollings","qldnick","iamedwardmjb","cams","gsa","markstaylor","mcg","sumudu","uli","brennan","agjustice","bennorris","harker","paulmccafferty","EricBowers","Sophia9","mergesort","ghm","danielstucke","Aisling","MylesInTheNorth","tomwiththeweather","CharmsFamily","rmcrob","unravioli","GrantT","jackwellborn","robin","andrewhinton","billbennettnz","chriswm","hemi","fancythatamanda","bookdragon","maggew","jad","esamecar","jonkit","topgold","tinybirds","drewbelf","AppForce1","bapsi","highsea","numericcitizen","denniskluge","ningkantida","estebantxo","lukeforis","wanderandclick","larissaking","dasdom","phaballa","dianeduane","workswellforme","macdhuibh","alonte","panicx","coffeemanmatt","pips","carinamarano","leavesofyarn","beingcarrie","aaronvegh","MacPsych","klischka","charliebucher","gvenk","mikko","stublag","lukas","theorencohen","Tales","johnlaudun","twenty3","KimLCofield","gildotdev","scriptingosx","karl","ryanstroud","512px","taibah","plamb","winston","HabibCham","alexsavin","schuth","kattrali","mnmltek","tdh","runeranch","pabloawad","tporter","danmills","Maggie","mcr","RogueAmoeba","jgmac1106","jeremybakernz","davidahouse","ryanroars","vivirxvida","todor","duran","rubenerd","Lynessence","goodenough","briandigital","Kalena","dubh","brandan","dougbeal","blair","bloftin2","baker","Bazza","olof","jessepelley","hankchizljaw","k9andkbd","frogplate","Ozzie48","petermolnar","geekyaubergine","derekpeden","JothamLim","divisiblegoats","dangrigsby","skalnik","faithx5","lewism","alltom","oboer331","Katedohe","tommysgrowingup","danielgenser","abc","Bigfreezer","FrankRamblings","civix","jordanborth","oniskanen","fourbrewers","fncll","kottkrig","PurposefulWarrior111","OneFootTsunami","ioloro","adorawilliams","jayeless","frank","taeve","jameskoole","martijnvdven","ConatusPrinciple","tiagovercosa","joanna","lucasmonster","jaek","robertsapunarich","pwitham","grubz","mersontheperson","jbytes","Kottley","poploser","ctp","kithallows","alehandrof","simonboots","wilsongis","jw","florian","bsstoner","auniverseaway","splinter","keinan","marydhat","stefp","dy","tbcrouch","Kcarrollnyc","will_rs","jimdye","Stefanyeah","bostin","shayman","aurora","scottgruber","adoran2","willfong","jefflocke","mgorbach","effinbirds","vaibhav","MadeinSpareTime","arzoriac","cfristrom","ahmed","bensk","daniellefyi","sarvagnan","phildearson","forktail","lucas","Cathy","nicolau","andrumatt","bekopharm","laura","corvino","darius","erwblo","chandra","kaa","ggarron","ChuckJordan","cliffboit","CharlieBrown","GoodandGeeky","StephG97","hartlco","nathanrhale","Jeber","jimgroom","jennilincoln","sethdrebitko","joni","corntoole","pkd","tomarra","mymarkup","skoobz","mickael","DrKnittyGritty","tomselmes","peterw","Caspar","bpaul","changelog","roberto","drewcoffman","nahumck","velkara","jaitalking","Patti","johnbrayton","flo_muc","rscottjones","Plutor","TIL","Denminn","aa","Theohub","alexwolfe","orionp","whitney","bwebster","felipetavares","muncman","sobr","purchas3","davekellam","phrequencyviii","nclds","pollockphotos","UnfocusedWanderlust","wcaleb","mcul","decarbonization","erunyon","jessekelber","jean2","tsang","OddJoe","glass","ctmiller","scottalister","matthilt","wakemp","Ddanielson","hiro","patrickhills","AlexKucera","vitorio","exocubic","content","gtback","hall","preshit","brettcooke","SpartanProf","davecaolo","timothybuck","pansytram","kellymackey","sexyhermit","stupendousman","DoctorMac","heinz","martinfehrensen","Securewaffle","foster","Jessgartner","montyhayter","fredc","wendywords","MrKapowski","heckj","miguelmanalo","shanezilla","moss","ClearlyQueer","leedrawsstuff","zoe","jamie","brandonweiss","et","mbadalamenti","yel","ctm","KyleEssary","dakegra","notmcwads","cliffordbeshers","Skroob","JoeHoffman","AndySylvester","permanganate","Schmevelyn","phnom","klickreflex","waisberg","rogin","tbc","ajay","jeffjarvis","jrr","OliveOctopus","macguru17","freeborn","danielbrinneman","springdew","ratha","jacobberyman","eick","HerbT","nwreg","ChrisU","bauripalash","kbizz","Porterwang","roelio","e_david","davemark","czottmann","sonicrocketman","sumemi","plumey","hrhnick","joshuapsteele","nicola","moltude","saeculara","psychicdrool","SolwayGal","sgtstretch","rafaelcosta","poritsky","cara","foryou","kkai","cliffhouston","tyler","flowinho","offlinejunkie","quinntchrest","dgold","jcampbell","everaldo","stolton","arkadyan","hughbee","errantmarginalia","bjarratt","nzherald","jakedahn","CalebW","thedadams","JustGoodMusic","jon","curtismchale","bismark","ddunbar3","BakingTheBooks","BenjaminHolsteen","fab1An","rosskimes","splorp","podfeet","sdw","llbbl","someone","skabber","claylowe","michelle","emojipedia","geewiz","scothis","sheersho","mpospese","jdjwrites","robhblake","rrw1","hbowie","chrislopez","dhester","bclinkinbeard","benjohnson","JRDonnell2001","Munish","hansv","matke","heyjaywilson","daitya","fLaMEd","clubhousehost","stoppableforce","mikehales20","infodriveway","pat","pratik","SusanB","eabando","iw","jeffleong","Burke","Hopa","bdc","awaken","sikkematx","phiali","samcat116","MacBoyceGaming","luxuryluke","markavey","drfluellen","agam","baileystolze","warner","kirschen","cmwilson","atetlaw","mruncieman","robertbrook","jpayne","awkohn","frankm","mec2973","AbbasAli","dsh1705","matthewcowen","easyopenpackaging","gerwitz","thoughthacks","Chrisdepew","oldemeyer","noble","elainearias","dylanon","harper","shefer","jws","taylorawhite","takeo","procella","ghedin","jeffbell","whakkee","savransky","galexa","JohnAN","tewha","AndrewForrest","portalgod","Grey","DanshenLiu","nejimaki","joshducharme","KStoneberg","adamvinueza","GeneticJen","ericgregorich","bradjadkins","ryanboren","evgeny","megan","AJgloe","sdresser","stanjames","juanlaube","tommy","nsmsn","YisraelBenPerla","tthing","sgarrity","gordonmclean","alpower","VioletPixel","billyschmidt","mypenneedsink","arinmearig","christovear","mcmorgan","Flancian","holst","canion","degrey","jidabug","atomicbird","rhonecast","julesb","johnpeterharvey","mwender","amit","zastrow","davesdowntime","barryf","mex","MultoGhost","jdm","disjekta","apanda","icro","h2ocolor","nghialele","joebuhlig","r1","ezellwrites","psford","thisness","reba","iggy","ctwardy","robertbreen","timyoungs","fake","chris","jstr","scottjeffries","jamesdasher","MacsFuture","JDsantos","corinnpope","Ianbradbury","ConspiracyHobbyist","neilbruder","heaversm","dodi","chadhelmer","Lappenihatten","brianross","davidchambers","digitalpardoe","fahrni","mareparkerotoole","FroehlichMarcel","kodo","danlyke","NoCarrier","twelvety","jjeaton","carolou","localjo","mossymaker","camp","taylorfriesen","vancura","Mattfinlayson","dmoren","siracusa","edbott","HBehrens","wragge","vincode","dgsdgeg","aarondowd","donovanwatts","katiemthom","prolost","mccarron","liss","johndgardiner","roundwallsoftware","Joanwestenberg","wellwellwhere","florentin","niclake","Jaredbyrd","map","Marty","andreww","RobertFrench","santosh","StefAd","mikeseb","Medievalist","danalcantara","bgilham","pajp","rebeccamidd","lankeami","jrbj","juha","cole007","reyhanra","andrevr","walt","d0gc0w","librarianedge","yasmine","claireon","fozbaca","scottelias","mcritz","Rongwrong","davidrmunson","amaeya","parf","paulroub","roelwillems","GabrielCornish","Cdespinosa","brownstudy","benbeard","guilherme","Sattelknecht","SJW","keithpound","meissnem","nico_p","webdevsponge","cccccccc","walter","sparselogic","peteschaffner","thatkruegergirl","wiverson","sten","awpiii","BlueImp","remmah","nclarkson","codeyourgreenns","jnjosh","johnathan","atkinsk","jiajhenbee","brianryer","skinnylatte","alexcox","hadal","toffer","weckerh","prep","jmswisher","itrackgiants","otak","rpmik","mroll","Grokit","lsieverts","quixotic","marks","reder","nibl","anup","leogau","tylerdlawrence","tkorocks","codemaclife","xkcd","sageciggs","Ian","thosch","bbum","Isao","mindofaaronw","GeekAndDad","iGarni","blasfemmous","mermaid_forest","pilch","groomsy","itst","ringgitme","mako","phill","geniusandsoul","maxgross","cwcoxjr","omerkhan","flanker","alt3","gannonburgett","johnnas","kenna","emiabo","CaramelBeard","kyleedwardwilliams","bugkrusha","bsebesta","hafiz","adambindslev","Nethermind","lmcly","5691OCT3","ricco","greghendrix","dave","chrislovietyler","Jrksjs","OpenResearchIns","chosafine","denvercoder","alicefromonline","marksteadman","nyhasfun","ying","lyonsinbeta","Miikka","TabTwo","divineblkpearl","nitinkhanna","pseudomichael","ekobi","ronbronson","jkisser","carmie","timmy","flutterpulse","home","iawriter","richText","bhsfree","ppidgeon","Zacb","kalmir","kyhelal","oyam","mira","tculverhouse","PBones","brentsimmons","devondundee","jeffmc","luana","aijaz","alans","leafshine","joelmearig","domz","nashp","kia","smoitzheim","val","adactio","hipolita","tomcarmony","tonybloggs","preslavrachev","nick","TurningInCircles","toddpresta","eli","ka","marc0janssen","TansyHoskins","wallamba","elliotali","dustin","jagibson","metamodule","iCalvin","JustAurelie","CabMech","MichaelBrooks","Insolubilia","heydon","gunnsi","krauser","dmcgk","Bruce","haikushack","soccer","wrenman","cheqin","jeffbailey","sweeney","HP","mariovillalobos","stevebosserman","chad","brettneese","tmaes","stevecollins","cruisingslow","indaleen","lewpiper","iangl","amongthestones","SinclairTrails","zekeblog","stickerdoodle","Judyk","digitalcalm","object_required","Tony","uliwitness","gaelicWizard","Sylvia","davidm","matthewcheok","notunremarkable","steadman","jeredb","Chirag","ted","zobkiw","junebug","jaredsinclair","bgoodwin","keegsands","tantramar","z428","LJPUK","vorpalhex","CGPGrey","JRGOODRICHBLOG","hr","heyjeffg","70BPM","StephenZ","davidr","40Tech","phoebegolightly","llkats","boyvanamstel","wocket","soypunk","shannonethomas","hithisischi","beernews","bhrnd","Akers","yatil","mbishop","kaz2020","waughm","mattball","abraham","rwnash","kfitz","roobottom","joel","ciyadhwells","jbp","jswright61","jalvani","microntest","chase","wesrog","jer","Cittaraissa","rbl","natebarham","joshginter","arush","vallieres","Hiren","jackzellweger","Carrington","Maurica","Denny","keoshi","KatieFloyd","Bismarck","kemayo","stattenf","kunday","jotuono","tkskkd","chuqui","whiskerpost","rosiesherry","Wevah","lizmonster","peisert","jonl","peternlewis","adamjones","heibie","naokan","leefeagin","scoblitz","tiffarment","samleegray","thunderkeys","AtomicTankMom","newmarcel","p","chuckjoiner","jamelah","greg","hsuri","eabowers","ptpower","shinyobject","cmdme","shano","pepibumur","andawea","marya","gebloom","willb","blumenkraft","balki","jsavin","plindberg","Brendanjuna","timmckenna","smansour","frakintosh","m","u","stevenpate","becky","Jeena","karsen86","dmaus","patternflux","NiklasDahlqvist","LisaOurFamily","Claire_Murdough","AJ_Hartmann","betoinbeta","nicholasderk","KristianBorglund","JoelPage","jaredwsmith","angier","vojto","Radwan","practicalwellbeing","mogami74","hunterward","joekissell","rocu","erikstarck","jonesbp","jimrea","smorr","mantontest","GlennF","ugiri","KimKlein","nathangrigg","carter","vegan","zbarocas","iPabloSB","h3h","morrismotorcycles","ybbond","oisin","eliot","drikkes","Parag","jarbogast","cmartin","jgulbrandsen","MichaelW","jokef","danielpunkass","erullmann","Huykhanh","terence","rlegg","hicksdesign","Bakery","bryantkelley","triatone","lia","bobschulties","jacopo","laanba","dov","emma","teachingideas","braindump","N","_type40","brandon","trvr","blogizdat","pscopc","joeld","agilelisa","Portufraise","christopherchelpka","taylorsmith","Hobbs","Yaohsi","sarahdonovan82","littleincrements","lmika","feadin","caffo","may","e","mirandahale","dana","doctorpundit","timtaggart","khoi","pauli","tommorris","neverwas","chrispennington","bluecaravan","cbc","nuncamind","b","chasentheadventure","g","hope","cptpudding","yungyolk","1pairofshoes","sander","Reenascripts","nic","kiyote23","kyubikitsy","Akiuk","Surgeon","crhntr","LFP","mcn","flo","gtdandy","wonkavatormusic","martinsteiger","zalary","Breau","robkelly","josedelgado","itskevin","chrislyon","monkeydom","lostinhaste","kimberley_rose","fossil12","KevinHoltsberry","tuxtina","amie","connor","CuriousStefan","rcjackson","rms","furstenberg","kimonostereo","camiel","b_k","news","mwillett","rowan","andycroll","malvenko","drno","V_","kitkatkarrot","stevenf","tomcritchlow","madebybenjamin","blake","michael","mfilej","PLNX107","ladyhope","chrispatterson","joecaiati","imsickofmaps","realDonaldTrump","manton","ricky","Clonmeldigital","hollowspell","juanmeleiro","mx","DavidCaddy","bradlau","itsjustmyron","SwiftDevJournal","uncrtn","bethzur","SamHawken","jared","clownshoeninja","webDevRich","aureliayves","mrjohnsly","razorant","lasar","natrix","Doony","kakutani","Estherbenoit","humandogcrow","kupad","Librarianguish","gospelsketcher","joeljmiller","justinpecott","bencrowder","miguellaginha","beck","dustinbucher","kita","carstens","WickedGood","lyle","staggerlee","nominal","capttaco","erick","kraacken","planetexpress69","barley","rcade","Bobfa","dnkrupinski","lb","dirtyhenry","LeoCarroll","dgdgdgdg","peterrother","jencius","pxlnv","gfontenot","benkimball","integerpoet","felix","jl_siewert","ludovicchabant","SoulWerker","rob","cwdaly","jack","lilyball","braker1nine","jaimeejaimee","susanjrobertson","fletcher0xFF","nolongerlaker","drlambchop","noxi","Brad","boondockgeek","mdalves","Squishband","patricksimpson","talldrinkowater","CraigsOverItAll","woolie","quentinlucantis","sayreambrosio","hhyu","davidixon","colin","herrkelpen","glabrego","Thegreenman","ryanjamurphy","Havn","kusters","mbattles","curt","cesiandalex","jenny","juliekuehl","lyft_shifts","robknight","greghiggins","mazza","rxa","eileenmh","davegullett","kiwi","hilayne","jef","atlwx","matharden","KevM","paulcolton","paultibbetts","rdo","chswx","HollyGoDarkly","gregmorris","thils","FeldFoto","frankacy","tim","kg","Moondeer","cyan","phinnia","AngeloStavrow","ianbetteridge","brittneybush","slowscan","danielsantos","joshuawxyz","DrOct","morton","smokey","anthonyronda","Lubna","kurtlopes","Omrrc","Thamer","bacciotti","elstudio","drinkYourOJ","spjpgrd","milkthealmond","HPCFarmer","z","skyzyx","kevintaylor","vanessa","nofars","billdeys","tibbi","luminarious","yoadrienne","benubois","MattK","narainio","aaronrosspowell","pgor","Wookiee","jmoltz","nickmjones","jamesfee","TinyCafeCoffee","geremygood","MatthewMusing","palousegeo","bitdepth","charliepark","jkocherhans","danielmcclure","esokullu","jeffreyince","pfefferle","davenicholls","x","alexwaddell","latacora","wences","farantzos","chriscooper","bsag","alexander","zmcartor","dr_rini","bkp","jfergdev","glennr","Oklahombres","brianjesse","hooper","jaw","nickvance","nwl","dailymiscellany","grumpygamer","achurchassoc","AndyNicolaides","syneryder","TheRealChadwick","iltempo","amrox","alexchabot","Hanni","CanDoCanines","peter","nertzy","joch","discocat","holgr","toastloop","zw","kai","arshanqeeti","hill","ks","mbeaver33","md","curiouskyle","tjw","remy","deannat","Julianizq1","jwisser","MarkJones","aj","pirijan","cheesemaker","gordonansell","humdrum","cubicgarden","seo","vanissawanick","micropage","kristianserrano","sim0ne","chadcomello","Cowlibob","jordon","andymitchhank","DogCattle","wavenumber","tracy","MarsNeedsTacos","arichard","nichagan","Hutchings","spaetzel","cigrainger","andrewmelder","mattharwood","paulkent_uk","cplong","lape","pottsie","froboy","wihel","spencer","randomasides","iChris","paperclypse","riverpoet","SciPhi","NatHarari","jemmons","robertk","aqeelfikree","nottadamb","k","magnizium","dannysale","verumsolum","cjhubbs","andrewkfb","owensd","geoffparker","courtney","Amosmagdotcom","antialias","nathanstrait","tingham","billharrison","michaeldpotter","anthony","adam","NTKF","jjustice","pumasalad","snptrs","Cleora","willfanguy","marykate","nothe","Brook","spaarkling","minah","webb","elaine","hishnash","nlasta","nilcoalescing","DiplomaticDiva","mplorentz","veganstraightedge","ElectricEel","l","dullgraphite","Evilkow","jwb","aamcking","jxpx777","o","stucki","costanza","Jickelsen","hkalant","bunchjesse","yuhaoc","vega","greg_burnison","dotsandspaces","rbazinet","mmq25","marxculture","danjewett","yurkevich","skysandison","johoo","stevex","JaHoo","andyhawthorne1","mjkaul","guildflow","santirashid","fscottneeson","chriskeene","jamiessliceoflife","brandedPixels","jjoelson","atevans","bo","marsh","renem","mrkrndvs","kaya","existopher","OliverHolms","reece","amos","Claudia","metcalfjohn","albrownblogs","nickd","MarilynC","expansiveskies","Tibocut","Mattmaybe","jeremy","michal","petar","Jasonmendeloff","chrispoole","benita_anand","adamengst","ctetley","thea","tmv","Pgiampietro","kala","k80bowman","TeganGemini","apoorattemptathumor","shell","Dinu","superkorku","ec","glacius","raman","techguy","jsuttonmorse","bjango","lorentey","SirJerkface","GhostOfTheNavigator","spTim","kennethfyi","felipe","mgs","esouthard","YellowCottage","timolaak","w3bk3rn3l","juliaskott","risager","thuong","Opie","thien","Hagiosgraphia","steveroy","freshwaterheart","martenm","gtch","strombo","timlockridge","jai","joec","timmitra","bobbyandi","andersnoren","reorx","hauserguitars","geoffpado","leogdion","TSG","TheTechHomie","saraheolson","jimmyadames","SMS","cheeseandglory","scrooks","oldtowneast","frique","ericmwalk","darby3","shinobiken","00dani","cowpi","ldlw","brettkosinski","stickmandiaries","cabocina","joeweiss","raamdev","khurtwilliams","McKinstry","breakthesystem","bobowen","JonLillie","victorkernes","Yossi","kyleb","nicholaslash","khs","euanlawson","kerim","holliston","alexvanderzon","Datapike","tyampope","nolith","mnguyen","zachphillips","plopp","davealton","cariad","singletary","dstanley","sublimefeed","ryanpeeler","HauntedRadiator","jakehathaway","InternetFriends","arturi","craig","chrismatallana","bryanbuchanan","carrotandcompany","JeenyusHavoc","garo","LSON","cy","meredithkuzma","williamp","scojjac","goldberrybooks","sailingwithben","rosemoe","pixelfrog","chucker","xcoders","seth","neychis","sam","gorlak","deb","kcase","soska","shawnblanc","shahab","christophercastro","AlexGolub","imyke","vnagaraj","jth","cory","tamaracks","bucky","joecab","jnchapel","genegualtieri","samarth","Xandra","jessicadennis","JonasDu1","Rza","boles","joejenett","_joe","6400099180","dkp","ashleyhinkle","rstevens","maryrosecook","KurtWerstein","half_frame","knsontag","yorrike","tebriel","philbranigan","Flish","8chi","Skrimfid","jsonfeed","mrmurphy","slamet","eliseunicorn","j","Drewzar","jasonwise","bradshawsguide","vasilis","MaskMeAnother","chetcast","scottaw","padraig","mbil","antpruitt","cb","taylan","paulrobertlloyd","benedwards","brandonthetinkerer","simpson","AoT","kevinmarks","johnbillion","pjaspers","manginaj","rey","abhikb2005","mhoye","statium","bjorns","alexhwilliams","nikolay","gwynethdorado","canneddragons","hawaiiboy","yostos","s","milsyobtaf","shuo","timswast","jayray","tre","Drengy","douglas","dpatriarche","mikeorganisciak","dannygarcia","rsilvernail","inkeduprunner","kokodev","paulgolder","natesilva","Schroeder","brandontreb","theclassnerd","travispacker","viks","joshuathenomad","rspace","errantpixel","JeffreyGroneberg","jonmolina","art_of_mirrors","fredmbarros","philly","matsuda","Nor_SeaTac","kennylee","jinscho","wogan","D","ScottHansonDE","hisaac","jonmichaels","MontyAshley","geoffh","derandre","richardleis","josdea","tbridge","jade","benbrignell","bjtitus","bzz","hn","lookanew","scott_bot","winnie","chuc","nateconklin","grassdog","gmatthewthurman","celsius1414","bjhess","andrewsio","DigitalGyoza","blurbomat","ndreas","marramgrass","unoabraham","jaymy","hoppysensei","dfr","sakurina","mikepattee","hutaffe","brooks","Izak","rainbowshieldworld","kang","vikramrojo","Jaynomics","roland","timvb","aviel","pepper","huijing","fdB","atml","nickpfennigwerth","cowboy","boris","Matty8r","fernando","PureAric","andyw","YouGoJoe","scotymax","Jocelyn","rcc3nc","Diana_Beken","DrFrankenshroom","guyshearer","NobodyImportant","sebastiankade","sgreenlay","invalidname","wfm","cygnoir","sproutlight","loveartblues","philipmorgan","msroest","speck","AtomicTankM0m","ClementComposer","antonzuiker","bradenslen","tylermenard","LemonDaisyOffice","briztreadley","jfew","shloka","haiku","Macpug","the","colinwalker","w","ericmaki","charmcitygavin","svenfechner","alexandru","tcbarrett","adamprime","rudigermeyer","nickkaczmarek","hillsprints","r","likeacat","jdbp","thegreenshed","cnstoll","jonasjuhler","RemoteNotes","nuthatch","incanus","jwoody","steveng5","tommy_thread","byamabe","adorientem","lorismaz","abackstrom","cleverdevil","shawnyeager","sg","benturner","pablomorales","Megan_Freeman","donnydavis","upgrity","agundy","B_Banzai","ghoppe","jakeyc","datguy","a_seagull_story","Jaapwillem","Paul","stefan","dellachelpkaArt","cgiffard","MadGlavSmoltz","MikeManning","mrmanner","veryswiftly","idiomaticrails","heyloura","nward","JZ","patrickjsteele","teedan","marcos","PineCellar","silver_ag","w1w1m","bennomatic","alexa","EdwiredMills","RouvenMoeller","rodrigoaraujo","sujay","deleteme","toddgrotenhuis","davidmarsden","y","tinylytics","soffes","Dejal","VioletCrownSoccer","SgB","robj","VioletCrownSoccer","SgB","robj","ras","nickharris","rossmcf","jimpick","Mikey_P","dbq","anna","zacbir","mrbeefy","rys","robokick","KevinW","donmelton","Scotty","grantcodes","stephtara","adi","ArnoldHoogerwerf","ptrck","TommyWeir","Albertkinng","ciaran","daveverwer","islandsofno","rjstelling","smithtimmytim","sawv","tylerknowsnothing","otaviocc","abnry","thillsman","fardles","malonemade","seanm","swanksalot","fcy","steve","tcannonfodder","charles","incort","crankreport","dougfredericks","RistrettoMike","DebbieB","joeworkman","tritchey","beep","ramzzz","markstoneman","takezin","mjb","AEngelsrud","bensch","mseab","HariNYC","takumi","zelle","jlelse","pcora","WritingandCoffee","jimcorreia","barelyknown","richb","ramiroruiz","teng","fluffy","nerveband","calebhearth","sathyam","cschack","jeremycherfas","caycepollard","simoncoles","giov","simme","sitewriter","billstclair","Technotional","jmanes","ryagas","ricmac","adm","Erogers","Nezteb","zorn","GoranVee","arajan","foresmac","bencallahan","unl0ckd","rustcellar","geof","skatz","benjamineskola","ian_whitney","LaptopHeaven","jaycee","jmac","chrisbowler","koritsimou","nickkearney","potatowire","snewt","gluon","rociocordero","craigmcclellan","mrshawnliu","benwerd","jackdaw","mcornick","bradbarrish","dylanjames","ben","jpd","ner3y","stevenschobert","Piscotikus","lukemperez","centerpoint","daj","Supportcoach","cleverangel","PaulnRhe","johnchandler","jpkeisala","gabopagan","cn","yuta","colincornaby","anilramchand","jagtalon","alexis","timswan","KimberlyHirsh","mjdominus","jonathanbuys","joyh","klundberg","jeffwatkins","mattl","Lioncourt","bruceblog","oh_that_courtney","Mackenzie","diederik","jbyoder","timetable","mattypenny","stitchpunk","C2","davemacdo","spalger","theWeeklyListen","darylbaxter","Molly","davidlilja","Darnell","lennyt","none","geraldcastillo","melissa","pkrebs","simone","rickardlindberg","mikepj","hvandenbergh","NetNewsWire","Nataliekayh","wm","SocraticReview","AshP","hutsonh","OffFleekGeek","SwiftTeacher","zemlanin","sfaxon","wesleyhill","suchasurge","lllist","shawnzizzo","BenRiceM","bascomlynn","gocha","mike3k","fabio","gusper","Vee","samproof","Magenta","machias","marcedwards","madson","jackjamieson","WaikawaNews","theweav","theguycalledtom","maj","drea","jcs","corduroy","jwurzer","robwatts","davecobb","egelwan","Sansaarai","roman","marcano","tarassov","rjb","IaninSheffield","Shawnhickman","PhillyCodeHound","asher","cabel","schmevin","jmjordan","t3mujin","joaopinheiro","amaslar","zsbenke","jfunk","tabularasa","parrots","mdbraber","ahc","Moltz","mirlisa","danielgray","ElleNewman","neven","drewallen","GaraksApprentice","indiekit","natehouk","Mrssoup","amerpie","polarbearkev","yuehan","thebrecht","philutx","mcelhearn","jonathansick","thegoofyguy","wardgeene","hexalspace","JamesFoster","SgtApple","alexanderbellgram","Jmendel","mranthropology","annap212","onepluszeroequalsten","mr_rcollins","amandafrench","scottyloveless","xxxx","maxrsiegel9","pa","brian","dopiaza","tjroyall","dandycat","travelingz","jmreekes","crossingthethreshold","keita","dangerousmeta","tiff","dmgmt","gabby","ecr","ishabazz","Kuli","nielsk","sneagan","dand","DavidAnson","Dougherty","tomroper","n6doug","stevelloyd","Larison","1DeakinSt","zeblith","JacksonOfTrades","lauralo","robtarr","lazylifeninja","Carnwath","dignmg","anujdeshpande","bblake","ridwan","pcalves","ronne","mikedshaffer","JonathanJohnson","stylva","ronguest","shawnapair","basicappleguy","samwightt","jeffreybergier","nitza","slaws0","kevrodg","jd","guanshanliu","dremex","miljko","tijs","anthonyvardizzone","elizabeths","josiaho","mc","neildoeswhat","dreadnaut","iiii","jays","twodads","chwilson","neatnik","pip","diego","FatFortiesFingoff","jakecarter","malarkey","inferis","wavelength","danwalk","eneconaglo","ak","millerde","babils","mrelacionphotos","eschaton","jimdab","leelau_lessons","philstollery","sp","jasonmcfadden","haresnaped","modomiro","natisho","jonb","ikuwow","yamahane","synciput","ncfoco","lukebouch","Sarah","thombehrens","crumblingbiscuit","buster","yves","CTD","IvyMike","chriswessells","krypt3ia","johnwlittle","nenads97","davextreme","steveriggins","eschapp","pauleychrome","renevanbelzen","janboddez","shauny","tmj","SlashTab","TriggerPoint","daveymoloney","resolution","KentGlenn","wildergods","adambarker","littleknown","Heikki","thecitysipper","roos","paulw","cope","thoughtshrapnel","Arkanjil","dustdaughter","brownlee","kbrice","bennettyuan18","icarurs","dsparks","honeyteaclover","mus","jeremyfelt","viticci","jaredigms","cjk","shime","camwardzala","rahulchowdhury","rzr","brianhoch","walkah","wldunbar","ssv","forestofawesome","AndyQ","alastairjohnston","ranarenoir","ekcragg","leeperry","tamelyn","halloween","turoczy","JMendeloff","moore","rosemaryorchard","roadsignmath","bsndesign","JonsHotMeat","rooted","cryptomedication","Artdog","Tester","linnefaulk","thewanderingv2","milos","zarf","sffegwege","masonking","anto","shadoe","ellewienbrock","davebriggs","neoyokel","joost","olisharman","demijmeraar","aphlock","oneboiledfrog","Neale","yskaya","ziahassan","jpcamara","EEMO","Bas_H","jenxi","Heiji","robini71","bwuerkner","trey","sillygwailo","rexco","alex_marcus","skippy","tori","karigeee","ungated","ClaudiaRichman","ellane","Brena","hk_","ScottMGS","jeffreyflorek","kylepace","chriscoyier","Teresa","rcgottlieb","Archimage","matthiasott","navchatterji","Sandra","melsoutdoorlife","evie","PatrickGilmore","tsmyther","adolfo","Plumlipstick","punnedit","csalzman","MFern","hobbsy","prologic","clowe","microb","k4rtik","Rrjohnson","camwebb","asdfgh","willie","minton","akula","cdevroe","hpadkisson","sebsel","calumryan","chriskrycho","cag","othemts","prtksxna","jensap","sketchnotable","softcow","CheeryHill","jacksoncouse","robertsdesign","art","joltguy","arepty","zoglesby","piano","kirbyt","erik","cz","brianh","hnzz","artkavanagh","matigo","marius","brushstrokegeek","christouranchor","tw2113","ablerism","rogeraberg","edent","humza","animalforum","sf","samgrover","thomasrost","arcarr","torb","Sebvandenbrink","Annie","LanceLink","Vvdt","andy47","edwardloveall","podiboq","scientifics","dandorman","cequin","rwgrier","jasonrandolph","stickerspotter","mguhlin","martinnorth","hlansford","alicia","jensimmons","tofias","jaheppler","christinerenner","iA","Coopey","joeduvall4","newbold","ethanhuang13","c0debabe","Design_at_Nine","stevenjwhite","jeff_ee","cdinu","mattbirchler","foojish","ferrousguy","bala","spencertweedy","irreverentmike","nate","AbeEstrada","latmo","cocoaphony","luby","ml","autumn","ameliailema","mbkriegh","apulianas","analogrevenge","mwill1993","tohuvabohu","nio","zackfern","enzel","JoshNicholas","KennethCook","dennisbailey","zmeus","littlelitewrites","akalittlel","ChristianRomero","selsky","cambridgeport90","marshallbeyer","JohnBrumbaugh","niclaughter","ccsont","AppLaunchMap","gruber","brenton","katleila","jonbash","xilkoi","jakzaizzat","WeirdWriter","clew","Benny","trys","LAVE","fromjason","christine","whitneyellen","Grayson","edtechdev","rgigger","RonWheeler","FoodVictory","jonbeckett","mrtim","SAHistorian","graphomaniac","ngaffney","hjertnes","tsh","carlton","tanchan","rglenny","beejaymay","johnchidgey","tallgoblin","huntsyea","soroush","blogroll","nkjoep","stringy","neilernst","lukehinkle","sull","macgreg","deniz","jordanmerrick","shadowlands","kevincox","notealoud","timh","notifj","Grokharder","aclaman","jamescousins","rachsmith","shawnmihalik","scottie","dynamitemoth","wjs","joshualfink","rhys","mediapathic","elle","abridge","ducasse","silverpine","tadpol","ornithocoder","kerri9494","coreywilson","bobmacd","sadikkuzu","jessealama","annaburk","cw","macsparky","jeremyburge","jan42","danj","pdp8","nekr0z","kylepiira","georgeblack","jeroensangers","elliottucker","trevor","apollozac","wes","jmartindf","johnwilliamstaylor","ph","mrchrisadams","MaryRosedeVega","Brent","amoroso","pixelgraphix","reedandpickup","danmurrelljr","kaishin","hexadecima","prealpinux","cdransf","jeffy","River_","SamuelWallace","troykitch","sarahbrand","keatch","jgchristopher","capjamesg","alexjj","Niek","albertoslopez","foobar","stesla","Varrall","flightlessbird","BenSouthwood","dgraham","jplupp","whiskeydragon1","rizzi","kjz","Junjie","Donburnside","jaredcwhite","jen4web","light_bulbs","linh","goodneighbors","zappy","mmarfil","jemostrom","thedimpause","ovan","crlzff_xyz","jgamet","flotisserie","dain","bdonnelly","frajarmus","zsoltsandor","read","bobiverse","kvertner","jasonrpeak","robojim","weatherhawk","madewulf","maddogdev","sencha","TheSecureOne","stephanhuber","sscott","morrick","talvinrue","matti","markw","kneej","stefanoc","Miraz","papergraffiti","Lutheran","alongtheray","yorticurda","rdodson","Darrell8657","gRegorLove","suitbertmonz","ma","shiorireads","joshsharp","dejus","Ukulele","Ralph","StickFigure","Christina","Franklinaire","hamtron5000","galtenberg","castro","Mikehendley","sofakissen","elliotlovegrove","danvpeterson","OneForkShort","benmccormick","fehler","ejd","bruno","zacitus","churchofhype","mathewi","karina","CherryJeffs","PeacheyMcKeitch","LGGInc","FALL_LYRICS_IN_CAPS","michaelmillerjr","jblz","MaxResDefault","samclarke","jimcloudman","mroberts","joleen","mbutera","Lisandro","powerllama","ldstephens","sherwin","rakhim","bgrinter","hartorange","xavierroy","zorcatra","joshlockhart","shedl","Brokenwings_goldtip","laniebarrett","vicky","rexbarrett","b_sackemark","justajot","oliverandrich","aek","HeatherMacShown","das_aug","CHi","philphorward","thomaslouisjonathan","ry","paulyhedral","SamWin","pewt","clairewoods","keage","cjkonecnik","jacp","Kyeli","jpoh","bstanfield","plilfordi","BastianInuk","darrens","cathie","decasteve","tracerous","kenworthy","starshipalex","mu7ami","damon","yury_mol","MereCivilian","sergevank","realkelvinperez","gui","zmh","noah","nickpage","benton","ccgus","triptych","murphysalvado","aaron","VirtualChris","adamclaxon","davej","Jrod","kfx","deeped","distantnative","maique","joeross","That_tree_dad","upvalue","dansteeves68","wiobyrne","Sethalopod","KelStewart","bck","hourback","times","ajwms","eryno","aphandersen","shaqzle","dimsumthinking","jyc","ericlaurits","nicolascroce","MrHenko","ning","pelles","jwelby","radrad","hoertauf","pawel","chet","bogart","jmac3665","laserllama","HerrBo","tobycurl","craigruns","gc","MissButterworths","jonnybarnes","boyu","mistercritter","chirpycora","riggingdojo","kristofk","jasraj","antonius","ginglea","fabioteixeira","nicktmro","whittle","strangebirds","alaina","calcallison","timbing","tuckerk","erwin","Richmattingly","evan","thaddeus","endonend","microcaststudio","toddheasley","ap","EpsilonTime","josh","jpsirois","linus","greystate","cdu","MitchW","sannalund","morceau","spiritbear","DDA","PresentIsNow","garciabuxton","techdubb","jamespalm","HemisphericViews","gregheo","krabf","dezinezync","edlitmus","rue","nueh","andymcmillan","marijuana37","nnnnnathan","crouton6","tattooedDev","jess","HorizonsOne","pbirkbeck","scriptease","minusman","kchau","cambium","avocadoprime","Hollandsha","j0sh","MicroDenbow","jodiefeld","aled","frozenoctopus","sunnygao","jamesvandyne","oddevan","dnielsen","shuntagrant","philbowell","italo_mendez","kenschafer","josephd","mjaygranger","edwinchoate534253443","jgissing","skypunch","ElleBau","xam","mantano","aaronblock","DanieleSalatti","rhayes","Soumya","dteare","adamcomputer","navalang","darreld","stevepaulson","mina","stephane_","Cherylrussell","bartkowalski","Emilcar","silverfox","gilest","jimmitchell","danieltiger","acolangelo","plainbrownwriter","petebrown","wtd","micahrl","karch","yoanna","ekurutepe","codytucker","thantzinoo","carterb5","mantondroid","aisling_house","clayharris","jxm","dcr","christianjunk","denkkerker","justin","crazyITman","andrewabernathy","gio","OrangeTrain","joshuabeatty","gb","jeffh","davepeck","jaffe","deifyed","patbak","adamstac","fayaz","geckonia","iinek","bens","NellKate","mcoutts81","ninthart","vrhermit","PaulOswald","manuel","lisa","weiming","ferbruno","Skarjune","xstex","tomlokhorst","kwadventura","levinunnink","hllrmnn","BrianCordanYoung","amble","Dawn","chameleon","jacks","pauljacobson","mandaris","colbywhite","merlinmann","ScottPostma","telliott","busreset","freyrthorv","sethvargo","drwho","hungry","calebhicks","mhp","mfamous","gwthompson","eaton","Aterris","empathiccoach","kes","dgs","technogeek75","matt17r","eludom","bret","smudge","davidbram","mangochutney","tamhn","hlt","ws","slf","glimmering","NateMorriss","jaclynpaul","warrenellis","kevinrose","luka","stifflered","PilgrimWitness","jplummer","rchlhyns","markwebb","ix","abanderson","writingslowly","TinyStreams","konjelly","Mark_DuBois","Ernestmistiaen","sharding","mitch","jshakes","wigbert","paulcraig901","aloysius","bastianallgeier","auntieja","garybandy","coreint","RobertLominack","brianmcmillen","madqubit","marcel","djt","AboveTheMess","snookca","emilymoore","siegel","nafnlj","zoem","romyxanais","lex","ed","westin","mike","IntlBuzz","RailModeller","DaveyCraney","eyetinerary","dori","jamesrh","jasmyne","rushtheiceberg","phranck","TryshHQ","Ilicco","jacob","justindametz","bplewis","antonior","lwdupont","devanjedi","spstech","jthingelstad","nano","oroboros","ton","jaminguy","zkarj","janhenckens","theory","gotwalt","nataliestice","the_enfp_writer","tomliv","joshuajudd","rlaxton","gregshortdotcom","bkb","stephen67","Hypercode","emison","lowercholesterol","pbyrne","diabetesmoments","v","eay","MikeR","jasdev","themenagerie","joakimkemeny","deptofthomas","Bijan","4nd3rs","Andromac","achimhaug","dlm","o22ie","estherb","emmessenn","Lillbjorne","csilverman","grib","holtwick","armadsen","jdlindsay","savinola","Dani","aksingh","dview","somanyhills","codejake","LoveWaikawaBeach","rogerscrafford","challenges","josev","blankbaby","mattgemmell","Serpico","djembe","ProfessorFalken","butlerconsultants","annab","arcandros","Mohammadhasani","bebits","mando","jrladd","meszarosrob","magpie_b","mdeverhart","ChrisRosser","kinnala","sabo","sas","jsanchez","leo","adrianhaus","danielw","malik","sarahdillon","MissPidge","NunoNuno","stevebob","chrisfoley","arobel","matsimpsk","amy0223","svbck","guineapigs","anarchyinc","jordanbrock","mruszczyk","zap","podcastcoach","DigitalNomadder","tones","jbwhaley","kerunaru","BinxBolling","echristopherclark","Teleb","hrbrmstr","kaprian","wassonii","FrankNu","fritter","jennifermjones","instar","dnns","hawaii","chrisleboe","whattherestimefor","joesh","basus","gcman105","davidshead","Jax","foursides","BestofTimes","AStarWarsFan","sara","tzeejay","Deeogee","digitalscofflaw","Fafah","scratchyvinyl","chrisltd","Jahaza","SuzGupta","JoeCotellese","mb","digidwaler","Christiine","nikkos","rajat","speakersunion","adamstegman","julieweisberg","artur","peterkaminski","safyr","AshleyAnneM","maeltj","Balcom","nntk","halinav","songadaymann","Blessdbabygirl","hynek","heyjonathan","Jsn","Littlesorceress","bramhubbell","zbrimhall","ikibkilam","manju3t","benmschmidt","darryldias","kevinwholland","ianjs","rplusg","Joranovski","stijndm","dunluvsanime","antcooper","liphy","huzzam","andrewcaito","radow","Altari0beyta","patricklafleur","Dannosaurusrex","lithasoyizwapi","trhall","Twen","foozmeat","faizmokhtar","jch","cmedik","recluse","lildude","byte","jacobhaas","sod","bratling","Praxis","indubitablyodin","WhitneyBishop","jtrem","lostintime","thorkon","sunlit","ranvel","rahul","tomralph","matthiasiam","ButtercupSaiyan","Erikpersson","bottledbrain","joalchin","emsariel","pIDGEnTEfLeGeNT","Bob","rogierlive","brashandplucky","qandnotandy","secfree","jacobjmorris","martyboymartin","audax","Lucien","jasongraphix","donw","davidized","multifactor","michaelgao2000","zerok","ashfurrow","zmonster","shyanyap","crivic","andreipopa","Planet59","comics","shahid","denis","roytomeij","hallgeir","auwjong22","frjon","emlyn","jackie","rachel","dangoor","adelle","dianepaintsflowers","mikiejones","matthewpalmer","Roddi","tomwhild","chek","thatzoegirl","at","saschaholesch","BigZaphod","cat","simonallaway","Sroxah","tinyroofnail","acfusco","wolf","multithreaded","crimsonsoul14","hbko","Starman","eyemadequiet","barefootwisdom","siddhantjain","maschavdw","Gareth","ericalba","Robbin","Silas","custom","jdsimcoe","maybach","mlanger","mstrkapowski","millinerd","shaneo","miklb","adambyram","zeljko","ArtGeek","jamesgowans","scoffer","poetalegre","stephencross","kd1it","kaimingmck","thaddeushunt","_","Alienighted","dictvm","Virginia","rands","theweeklyreview","benhager","bangersandmash","ericleamen","tina","iamtony","jamesdbailey","mikeoldham","jeannie","jsalvino","jeandaniel37","Bricker","tallin","EvanLovely","amybeth","rossk","xb","rufo","nathos","neurobashing","acf","seishonagon","kait","Grant","len","scottwhitmore","jerome","gale","dewieloso","Rosenkreutz","abhishek","webology","bbowman","samdavid","zacwest","Shaylaortiz97","QUARTZandCOAL","BSutich","davidegallesi","j_r_mac","chaitanya","ttscoff","siwei","teisam","pcrock","toddmc","djawidborower","Drumturtle","jeremyaboyd","chrisod","inksprout","incongruousm","AlinMechenici","MrGibber","theofrancis","allaboutgeorge","mg","griotspeak","johnbarbic","atog","austin_britton","Pax","kleerkoat","a2mb","beautifulentropy","DAD","pikseladam","scottwater","bentsai","Lizardguy","kpl","jgarber","jolilius","Steamboarder","zack","jonn","bigjim","l3db3tt3r","hessma","everson","aeryn","vg","mjdescy","asocialfolder","jjdaley","OldhaMedia","ReaderJohn","jimgibbons","eastbrad","purisubzi","bag","elron","nickleics","douglane","hcmarks","DHSDarcy","leem","waynedixon","dm","jerodsanto","mike_","JonCast","eshwarnag","jr","mattmiller","omargomez","chrispederick","davidcuth","portland","mekitron","eldonyoder","chaseachu","pd","rozzer","mymind","pratyush","wps","dunn","VicsVita","sullivantss","fblanke","chriskacerguis","caseyhansen","youens","christianmarsh","Thomas_U","WiredDifferently","davesaidthis","jaylyerly","jasontucker","johnsundell","strengthentheverbs","kevinwhalen","octothorpe","Diveauthor","jakob","joshbrez","awahl1138","chang","maggerbo","wolfe","almostaustin","iKeating","vincent","rosscatrow","mistersql","ChrisReed","bing","JesperBylund","rafaelg","f","jhcoxon","swissmiss","ccarella","pbg","bortolotti","daboyter","sbphoto42","abrahamvegh","guan","sridhar","sarcassem","dixonge","Changeling","chadkoh","Zak","njr","iconfactory","zachleat","mountaineerdave","Crippa","pkboi","Smooth","SimonPeng","tracydurnell","mdrockwell","chuckdude","mvr","roa","eric","lotz","johanbove","seasonalight","amatern","bobwertz","raguay","vickyvee","mrwulf","thesquare","apenning","destroytoday","logangreer","Cassia","rmdes","MyURLIs","neil","mtancock","davidcelis","caitlinaugust","schleifer","susan","emarsh","SveniBloggt","Velvetshadow","bjkraal","saskeets","mbd","DazeEnd","ericaflint","pileoftext","EvieIrene","mattmetzgar","Kicca","flufff","jmftrindade","pimoore","Lawrence","bbebop","bethany","marco","matthurley","emilyjoyner","paulgrav","Intotheroots","drewfranz","jeffrey","pepin_neff","zeitschlag","Vittorino","aquinton","bas","autisticanecdotes","jeffsherry","wallbe","iTod","TheRetiredParamedic","stulennon","chillyorange","fine","jacquelinegertner","dyu","miketrose","avinash","carrie","pilgrimsaint","benb","polymath","bsackett","ukraine","Talonblade","joha","Geekmoose","changewriter","isaact","therealadam","naveen","debbie","HOTPOT","rickcogley","kwzn","schmarty","aboynamedboom","bradleychambers","ivancantarino","yonomitt","carly","losiu","Andy_Page","nosolosw","DietCokeQween","beaucollins","Mimesis","jsv","paullandry","julian","dstan","epodcaster","tmp","erikdoe","ChrisK","rafa","roly","carlosefonseca","omni","sgoodwin","Mtt","ParagraphofProust","diegomartins","mulle_nat","yukon","verbal","pedroin","djwudi","mattalexander","wakingideas","tjluoma","cristian","Sammantics","andrewwickliffe","Valray","Thibio","bgm","Dukes","A","gh","tagmut","carlosrodriguez","gerrior","tmo","dmatthams","kelake","gblakeman","xtof","SweetAndSalty","renolc","kimahlberg","jmueller","deepsubwarrior","BradEllis","spratte","umlaut","IAmJamesHall","paimo","meg","blackrosemd","fgtech","ctokmo","bowers","gubler","moonhouse","markusmars","c","barron","silberman","richban","hamdev","randy","pbacken","megak","photografia","joslyn","apb","Shpigford","pel","nosound","klandwehr","elianthony","codemonkey85","jakeg","MichihiroOta","tchambers","tiff_frye","tommcfarlin","_davenott","jaredk","josephratliff","MKoopaJr","darthweef","_mochs","7robots","ciudadanob","mrock911","drquadfather","bradg","lunawithers","KevinRees","Barryllium","zoltan","voxpelli","devi8","alre","samkap","snorky22","duerig","Manningscripts","yanasi","rocketpilot","marclafountain","mattias","eggfreckles","drstevok","channah","Gregory","louisdhauwe","chrisbrooks","michellejl","ElectronStudio","kpages","LUKEHAND","oevl","kimheong","daiwei","JayGogh","arnorb","cameronrthomas","lonita","eddieking","JaneN","Elroy","Sricks","jtbrown","sarahshotts","sven","shinypb","ani","haus","millenomi","jerrybrito","peeter","Kurt","thatstef","pan","hollie","friday","valera","multiplexer","thebigbabooski","georgemandis","spgreenhalgh","bradbice","samradford","junethomas","Alcedine","delong","wolfpaw","jeremyfranklin","branden","Laurentb","wolframkriesing","soutpiel","jtomchak","Skematica","andrewford","philippeguitard","jakemarsh","kevhealy","funkypenguin","sethw","jmb","carsten","scarlettfeverr","shinratdr","brandonlee","dswanson","adamcroom","chrisd","kstefilips","kunal","milesbarger","kalperin","orrenmerton","mwerickson","tgb","notdroppingcameras","facej","dh","mejia","elbrackeen","merill","kwlblt","leeS","miz","axodys","colelyman","chockenberry","migrant","viharnica","distilled","awarsing","brecht","Zannab","zorxique","quebin","jackamick","jamiza","Petbro","Mshields","cliophate","koruibo","BostonTennis","poison","eaganj","entrobert","mikerapin","olliejudge","mrrcollins","muddylaces","anieto","mdhughes","troygilbert","nearwalden","dentonjacobs","daviddickson","mel","kludge","andrewmglaser","bduff","PigonaHill","Speedmotor","cnolden","kristine","marcogovoni","author_sdbrewer","drahardja","bgannin","WestworldRewind","vishae","pberry","aneel","Fijimermaid","davidcmorris","valerie","straydogstrut","ryancortez","philipbrewer","robo","rsol","irvin33","misadventurer","h","Rori","chenshuo","ChrisVega","kennethlarsen","kylecronin","ndw","rohit","ritz","sjwillis","msnintendique64","Mediapeople","senzaflash","Bodhipaksa","BTrimble","ckrause","gregmoore","jaspernighthawk","Aront","kbayer3","vanderwal","kaidombrowski","HiddenJester","quarterback","DC_Writer","wendy","Dino","Michele","peteashton","lynnaedayphotography","saraimitnick","DavidReidy","Debbie_D","Legopolis","KP","toddgeist","johnjohnston","clonezone","eddyg","tylerhall","schlawas","hyperjeff","Shakira","wjnb","chrishawn","CameronR","bmwrider","andrewraff","jgordon","macbirdie","jatowler","bobcatrock","craigmod","jkordyback","gendalus","meta_journal","FLotus","danfrakes","dcpace","designatednerd","v7k","nonjo","luke","sdp","justgage","Zoo_Lee","MegFred","CarolineAnn","tubruk","holgerfrohloff","veronique","sergio","buck","badluck","natalie","saltysiren","cholesterolbreakdown","ChiaCheer","danielpunkass2","belle","toph","justinw","mattie","mojomicro","Motiv8Yourself","scottymcdonald","APixelShort","RickCartwright","joshua","BivBros","ke4pcx","matt","JulieBrehm","jamesloscombe","workflowmanagement","andrewpbrett","json","goldenskye","jean","ejjett","nicolas2fre","CharlieThomas","EricMaierson","ChrisJWilson","mafe","benchr","zachary","jjac","heyscottyj","ole","rorysaur","bixfrankonis","backyardhippie","johnholzer","duncan","alansmodic","Jerm","jacklhasa","david","Sylari","ellie","ParisRoivas","applefocus","DavidLeeFields","JezB","Palleas","JorvikDave","podviaznikov","slocker","MartynChamberlin","lloyddavis","pmcconnell","jameshall","limako","suzanne","cumdump","jv","jeff","kanamiw","mosier","onemanandhisblog","mxstbr","adders","Eyebee","rolandleth","whoatowow","jeffperry","madebydouglas","jcbpl","johnkeyes","aliou","Iamwdunn","djcoffman","olma","yann","drdr","ruhrbube","j23n","jacklenox","austin","theguardian","markanderson","newamsterdon","axel","davidsmith","dotproto","Memex","mjtsai","orestis","mellowdave","richardhong","totocaster","mm","davedelong","johntmoist","jafish","mikka","somedude","smartgo","samharrelson","blog_bleistift","Huff","coldbrain","Fish","lena","roadtrip","ankit","jamjam","All_That_Jess","AJBock","gesher","danimal","cjdowner","bdesham","deojuvante","soulcruzer","jNash","narbs","samueld_james","jl","giffengrabber","joeblau","heidi_helen","jsamlarose","Jadedfox","Ronnie","RedYoung","bnmnetp","axbom","IndivisibleBlue","zs","hallerose","vladcampos","moridin","juanfernandes","EddieHinkle","Nocturnal","raf","Alligator","pcherkashin","kevinhoctor","markvega","alpha","collin","mjhagen","zeer0th","jedda","paulbrown","DoctorWorkPsych","meganfrederickphoto","znek","heather","nm","heesoo","todd","SimonWoods","rmsubekti","agprosser","seeegs","Contz","StevenKickert","modernlittleme","cgvita","samjc","jtrainer","leBonheur","dougmckown","digitrends","isaacmdt","cyberbobcity","andrewterry","jquinby","adrianizq","ayjay","timtrautmann","mattparker","aaronpk","mitchm","herballemon","Inoreader","jowanza","rom","johnathon","dj","roscoeellis","microdotblogtutorial","nilsneubauer","mangoumbrella","lawjeremy","Lohn","hjalm","ryanbooker","superpixels","martyday","p3ob7o","synth","anniegreens","michelleakin","midath1193","krispayne","djMylesradio","itohsnap","perlmunger","nypinta","duncanhart","Stacia","macrecon","billreviews","encyclopediajones","rrees","casey","jeantest","rsfinn","SimonDH","john","appademic","djaiss","AllanMac","LaraRhiannon","workingwriter","mjmoriarity","Micro","Lp","ben_kane","mirple","marcineden","MicroMojo","danprovost","cote","ronmccoy","devyn","benfb","thomask","mobivangelist","joachim","chrisaldrich","Claes","mbjones","mountaintop","stupidJunior","benstiglitz","benop_jc","gorka","therapywithcolours","natlogica","sosodave","jhns","resharpe","mattclower","mal","russwinn","jsorge","_gizmo_","steveellwood","JasBar","spry","deltafoxtrot","swpond","gte","Shaun","OlovCarlsson","codeasice","srd","dfwegwegwe","caseymhunt","fraying","bibliomarket","tverschoren","moritz","geel","cms","Rolf","ringman","leighintexas","cnjbrownbear","LTG","carrulo","dzombak","Jhf2727","kicks","catlan","Atomicgirl","aaron_pearce","lucvandal","thponders","kjaymiller","Guy","phil","alwaysadventurellc","jackbrewster","fundulus","dshanske","kitthod","mmm","kharrison","seanrich","mjg","griphook","gracehahn","leifwright","justincabral","cmajor","greyhoundforty","vinbak","iOS","wezm","Orange","Purple","EmeryGray87","andyfromtheblock","Onebanana2","jjj","claycarson","NO1","dariusz","melz","lgbtinews","Justinsharkey","jamesmichie","johnliedtke","codyogden","daveydreamnation","jjn1","yanke","Justinflood","tonyroca","ckx","google","mrdak","maryg","alistairlogie","Nathan","finalist","ErnestoUstariz","fschuttkowski","mayaland","CraigJames","michaelmorrow","neror","PatriciaBT","jasonbrush","thinkbob","hotcereal","Ardvaark","gregglatz","alexd231232","badshow","cc","perry","dumdidum","ScottJones","nathandyer","gglnx","nocturne1","petros","watsonstuart","extratone","gonsie","Mountainhomess","thatsthequy","estelle","michaelchan","stlhood","theNeXTfan","twostraws","ely","onlytruejustin","ImminentMurphy","mikeschmitz","wayneward","chayce","maxjacobson","marcelweiss","mkaz","wicketgate","beam","cschrader","zoziapps","andycrossett","bbech","mattw59","doe","oddway","davidmead","solomon","pico","appliedkarate","hobbsandbean","kappanjoe","TheThirdRose","micron","Bluetrainers","BalancedLight","jmock","madda","ben_","Microblog","arnalyse","ShayneTroxler","timbueno","Axcelott","dwjett","rickgigger","nelsonpecora","narrator","lind","bradley","iDuck_Pro","ahmaud","jx","garison","rusty","asaunders","jwthomp","NancyHousego","joelafferty","PastorDana","joe","Goranko","drsdayton","Lennox","RyunoKi","productrocket","Sambassman","MacVader","abhinavmarwaha","lizchen","calebjasik","aberant","krisbrowne","RLFloyd","kraft","fouquet","bulgaria","smithx","hellojoshwithers","Kevhamm","jackv","nrn7048","Scott_Smyth","paullu","peterpayne","brenthueth","daiiiiiid","rayfromsaigon","thedansherman","jeffreyparker","ramsey","claudiasnell","adamn","vw","bjallen","mt","generativist","applejosh","dwalbert","BusterMcFly","ronaldoussoren","xianfox","tomorrowville","gkeenan","sageolson","sjp","cristic","rknightuk","drewcastillo","cydney","fabiobruna","harrisong","EmicoOtero","spsneo","Chrisleeladd","oceanzhuo","terra","zzarrillo","keven","dvdlite","JonRouston","edvinasbartkus","samdeane","restlesslens","Agiletortoise","MissMonique","vincenthorn","karthi","nickjenkins","scottweisman","aravind","chrisredrich","scotest","RRVSports","timeuser","pl","akimotor001","LeoWong","paulca","i","acorscadden","Scottw","updateleader","joshl","lgbti","OneJaeAtATime","bwinton","GreenBountyCAPS","Katya","highfencefarm","edobld","GrindWell","rowbradley","carlrustung","archonblue","brokaw","ibmacin","sb","jjmartucci","amyhoy","theresamanelis","nikkithayer","pl0","booksfilmsart","Logic_flux","tjbarber","pgkr","garygriffith","Fireheart","anne","Stevsmit","greystgirl","timmedcalf","dantz","Saltysparkles","ciemnika","julianreece","willwade","findingfeeling","traci","superjens","ritchie","rmarll","rufferto","helgeg","monday","zwei","lestrrat","ampsonic","jtm","oliverb","Carolinahawkeye","voyager_cast","chrisreeves","ehpplemusic","damiano","jackyalcine","nadjabester","gamesdesignart","gothpanda","johann","Gabz","adamprocter","reeya","RayG","auran","NanaOsaki","Eric_US","brentacPrime","lc","smith2t","sdevore","mrj","tPen","avi","Aleen","jpersson","ivomota","ItsGreg","Sheryl","jackrnicholas","fsteeg","yogaprof","matjpacker","robinsloan","cvplover","student","Chris_Lawley","Elf","voidfiles","rollingbb8","fidelnamisi","jzfski","yeliu","DTSteele","donmcallister","Sanat","brunocampos","kandr3s","tekl","DiarlyApp","timriley","schenkenberg","rperez","arodriguez","ablaze","mds","initialcharge","ross","gilmae","clairejordan","gentlestrides","pauld","brian_renshaw","retrophisch","ransom","sks","moderation","jsonbecker","is","backlon","KyleEdwards","robmacandrew","milesmcbain","jarrod","sk","hvp","Tjk","MojoDenbow","omelet","chipotle","stevepbrady","blt","kgm","vowe","truong","danmactough","gmc","me","janasemrau","hendley","Wheels","khakionion","pineandvine","Shelly","wayland","ambv","jfro","liz","Contrariwise","cmarriotti","bradsbrown","jordanduke","justindirose","alfarhan","Squatting_Buffalo","blackfog","Spacekatgal","rohdesign","andrewspittle","blalor","artem","binkdotli","mikes","gif","sprachsam","jeremy2","mccallister","nickymartin","niekhockx","akulbe","pieterjongsma","herself","mdiluz","bartolome","leander","alexhillman","fox","erinlks","JensKessler","Thefatveganchef","strlng","richonrails","frassmith","MrMattFree","ryant","ss","Pavan","pascaltiemann","_Jordan","roshanhegde","robert","jlundell","forestweekender","gburd","artisonian","jensands","cuauhtli","mikehellesen","mybigapple","Paul_ftw","mattischrome","jamesdempsey","apike","magnushoij","n7blk","kocienda","gavinknight","anthonyallison","Omrqadan","lonnielemaster","peterseibel","donut","Grigor","flightblog","dumeny","scottmallinson","academicdave","Loganr","apoorplayer","dustan","keegan","powrod","mountainwindstudio","kitt","timapple","drwalt","kwh","bazscott","BruceLayman","trevorstinson","Aldeva","erikweese","opticsinspace","bryan","ann","riverfold","ryanmoore","universa11y","belabriggs","rwthompson55","joey","ft","bobdel","Bodhi47","mitchartemis","shep","Daryl","Ncantado","muan","apple","jalkut","donperreault","DaveSofNJ","blundin","jjm","thiesaj","mgh","brett","genmon","Funkaoshi","TheMightyRuxpin","james_","krisblack","BlakeLarson","MDonaldson","Cupcakegirl","Voumig","braithwaite","KellyHoffman","patrickrhone","TheLoneSentry","michaelbishop","bbohling","carlesbellver","gannonnordberg","elliot","jburdeezy","alis","mthingelstad","jcouture","flargh","benn","jhull","CrispinB","dbreunig","3gardenias","Zachnielsen","zachhorn","zwinn","samwarnick","jati","ku","nitai","ShawnKing","jmuscara","cas","aishorts","robbettis","circustiger","danbarber","jshulko","makzan","nathansnelgrove","kevinjcash","hmans","sebastian","nuclearsquid","pritam","robw","stumax","willtmonroe","humdrumdeux","olry","rjomara","roghib","leebennett","Winker","kluivers","100DaysOfTravel","Cecilie","stoffel","davatron5000","vmstan","happyobjects","frozzare","emp","Technotextnician","lemoncurd","dzacarias","jkenton","jabel","MoreThanOrange","redscott","dowd","marijuanablogs","gnallen","scott","eicker","klagefall","abbott","stephencoyle","claw0101","feeney","theabbot","rochmind","Jeannette","dwineman","mortaine","Moze","melchoyce","scottstilson","theblandshire","Jsouthallbell","randyjonesnew","blowery","vichudson1","tippy","nealjsivula","Jayhoffmann","gimly","ChrisLAS","damaskin","janrippl","johnbeverley","jlllllll","starrwulfe","danhasnotes","nevan","mschechter","dustinbagby","maureenmilton","ericlbarnes","GoForTech","poetryandmadness","azcurt","Dunk","ashley","paigelanders","windhamcaroline","quico","ilTofa","twmills","chericpraise","robmack","RSiegle","mikeshields","deverman","alechash","afif","bjk","bchoward","Padakitty","Kfinkjensen","NathanLawrence","ApacheExpress","dfj","Semaj","waldo","Ark","Jablair","jamesolon","Jezper","bobkopp","KathySmith","NozeIO","zachpratt","steipete","ricardo","Tharrin","jacoby","dfh","thebarkman","kristian","danielkuney","teachandlearn","mathijs","mod_swift","velocykel","handy","dmb","gyuri","Larsen","shanahben","AlwaysRightInstitute","Raylosophy","benmacgill","china","helge","SparkofAI","yaykyle","Christopher","linklocker","max","AcciMental","brandonmaul","DannyAnderson","stokini","josephaleo","nighthawk","kezzawd","PaulWilliams","davegoodman","casademora","davespriggs","sivers","Tylerh","ScottSpaziani","dameyer","kepano","mark","remeika","tibz","preik","jkorentayer","tgray","TacticalGrace","fredsrocha","djans","pottedmeat","rooster","ianfuchs","brblck","juan","cocoadelica","smockle","yanlyesin","bnjmn","Salvo","Alexandra","webmention","shindakun","ellyloel","jdj","oelna","philroy","RareKawaii","mtrojak2","jina","bkbkbk","lukecrawford","Raineer","TobiOnTour","Shamir","micahreeves","d4rk0r1g3n","Avancee","mattwest","rnv","alienlebarge","briandant","endquote","HumbleThoughts","EBP","ryanlane","drdwilliams","goblingumbo","himmelende","ben_hr","baldur","s2art","jakeweber","Sambuca","Nialljd","warnerte","wtf_ynot","Fritz","Applegeek","bzigterman","stewartstarbuck","themindfulbit","mindbat","michaelwalters","carlbrown","Tumblewax","name","Bruff","Khaled","hpn","gba","leyrer","glenpiper","oliver","matthewlang","urlyman","rjames86","microadrian","grey280","devsl","britt","zakb","jeffcomstock","wyldphyre","birkin","mkc","sotoole","cleardemon","davidlowryduda","notmadison","Adam245","sunil","KevinEagan","lilibeff","BobH","ZeeQL","nostodnayr","drray","buzzandersen","bomberstudios","davidbgk","duncanmak","83n74m1m","timt","kalikambo","ronkjeffries","mmetcalfe","gclark","revmhj","puppyrey","boa","RossA","fellowtraveler","JohnBrady","HEIHEI","jcernelli","DaveWoodX","ChrisAMcKinstry","andrewjanjigian","hadret","stevesnider","crys863","vazquez","drhayes","silviogulizia","_Pixel","davidpierce","ppatel","cstrauber","joeltimmins","Cyrill","classifiedkindness","spacenerdmo","pdemarest","rejitara","maxzsol","duck","nashmoto","kentkersey","daveberry","cozyHousecat","chinavisa","myles","patrickdevane","medlund","Keir","doodlewhale","conradstoll","lifelovehope1","bamford","Rym","Ron","lifelovehope1","mlm","Rym","Ron","WillamKowalski","ftiff","lmc","superdavey","dense_array","lostfocus","uaoeuaoeuaoeuao","derflege","burnsey","kavasebo","torresburriel","mejh","minty","shane","roblef","timbrown","ceelian","henshaw","skellis","CaseyK","calebd","noodleChaser","42yeah","johncabrera","dutchvirtual","odd","grmr","krachliebe","brian_wolf","Jaxter","ItIsWhatItIs","kylesethgray","krzysztof","jesse","while1malloc0","DerRemo","JoeHessling","muhh","jt","bethkoenig","MarcoZehe","paulson","bdougherty","juliainor","_Annie","robinbalen","robbyburns","MDMDeals","swm","JohnPhilpin","chrismcg","EngineerSam","microluca","Lis","joelhamill","derek","simonblackbourn","justinhudgins","jpurnell","desparoz","vladcampos@mastodon.social","mfmfmfmf","dansmock","jospehaleo","smnevans","TakashiSasaki","wanderingm","chrismena","jamesgreen","eliajf","Bhjerstedt","kimberlykg","avgun","Gyllenmane","parisha","philosopher","fillment","vimoh","maxinekrebs","jamison_blair","jerz","ethanschoonover","thorns","johnderr","kirabug","eurobubba","evanleck","ericbgrey","alice","HB75","spencerrule","dennis","rs","coolcut","inknideas","mcgrath_sh","BowersVoice","leah","josh_____d","icyjohnson","tullyhansen","jonah","stonehengerocks","benrenegar","ChrisHannah","ninagobragh","matthew","markuslyngmo","axblain","djacobs","justB","vito","Danny","donmacdonald","belimawr","jnb","newley","michaelfransen","synesthesia","tgaul","relayfm","Schrye","ryan","davew","empetch","jeanbarrossilva","bgatley","nitinthewiz","dianamontalion","mattlt","jonathandean","matthewcassinelli","sash","cgrayson","MikeFurtak","jasonawise","seansharp","mikenz","jamesr","karlfreeman","luanacoelho","flexnib","hollyhoneychurch","cogdog","kognate","matthew_mccray","berberich","marmanold","ramesh","shaky","Feriz","onewildcrow","sirshannon","glenfellows","RunLevelRobot","brianp","auntiep","pcperini","moonmehta","misuba","keto","BWLNG","truefalse","realmacdan","salman","kaneshin","chapman","weyhan","naturalholistic","ictedu","harveynick","davemcleod","vikingsversussamurai","kylewm","snarfed","areyouageek","brentajones","blns","gatekeeper","cpualani","pankaj","joshmoody","sergio_101","binyamin","rosamystica","najara","iDeveloper","lmorchard","george","dancohen","Jordonia","Redrat9","daniel","lorraine","meep","peroty","Aywren","michaelpporter","krikang","bbchase","kategorman","cesco","JohnKyle","naomijanec","jordanearle","eco_dialectic","towittowoo","thomasbibby","bluefuton","Tinfoiling","Verso","Jilli_anne","ines","bisonbrew","danielsavage","Noodles","PortuVenturas","yurymol","alison","mattwallin","lure","devilgate","amyapatil","denbowmicro","activatelearn","JimRain","Rin","NomadWarMachine","Beccafroh","Cheri","sherif","bertrandsoulier","Gesmithmd","StepfordCuckoo","mudkip","CoreAssistance","eva","taramann","mphilpot","rajeev","colmulhall","jomalo","zoewilson","andyfleming","dbuntinx","SP3LLLZ","dallas","terrygrier","mattgallagher","octover","duckrowing","gdp","clorgie","jeffwiegand","tucker","tww","buh","zerogeewhiz","pascaldevink","braz","abctv","jordanellishall","hdc_digital","cfrandall","davids","dave_caolo","ploafmaster","trio","byron","zephyr","scotticus","mrjava","joshpennington","josephwood","rulix","Burk","offline","jahziel","jason","lmullen","SariSchorr","Dadasophin","benjaminrivers","Eddie","kjohnson","ianmjones","Loz","MichelleFelt","davereed","njt","djloehr","EUwatch","puran","lila","shawnhank","renatarocha","elvendrim","Death","help","darylhaines","akurjata","jennyrim","panaphonics","Antura","indiesarah","ismh","doraeminemon","warriorwidower","markmcelroy","Vickyonit","miinx","RCP","repspace","danwood","chrisheck","_matt_jay","koddsson","kirk","FrMichaelFanous","echoz","tkoola","Om","kenley","MustBeArt","Shepherdess","annahavron","keithg","noondaydream","fredbou","Orris","samureiser","sadlerjw","mroutley","DaveWood","tempertemper","kvangork","morgainebrigid","elbachoo","bibliotech","cleolinda"];

Deno.cron("Follow more people", { minute: { every: 1 } }, async () => {
    let lillihubFollows = await mb.getMicroBlogFollowing(_mbLiliihubToken, 'lillihub');
    console.log(`**********************`);
    console.log(`lillhub is following ${lillihubFollows.length}`);
    lillihubFollows = lillihubFollows.filter(u => !u.is_you)
    console.log(`users with no one to follow`);
    console.log(JSON.stringify(noMore)); 
    console.log(noMore.length); 
    if(lillihubFollows.length > 0) {
        lillihubFollows.filter(lf => !noMore.includes(lf.username)).slice(0, 15).forEach(function (u, i) {
            setTimeout(async function() {
                let neighbors = await mb.getMicroBlogFollowing(_mbLiliihubToken, u.username, false);
                neighbors = neighbors.filter(n => !n.username.includes('@') && !n.username.includes('.'));
                console.log(`${i}: ${u.username} (${neighbors.length})`);
    
                const lastOne = neighbors.length - 1;

                if(lastOne >= 0) {
                    const followMe = neighbors[lastOne].username;        
                    const posting = await fetch(`https://micro.blog/users/follow?username=${followMe}`, { method: "POST", headers: { "Authorization": "Bearer " + _mbLiliihubToken } });
                    if (!posting.ok) {
                        const error = await posting.text();
                        console.log(`lillihub tried to follow ${followMe} and ${error}`);
                    }
                } 
                else 
                {
                    noMore.push(u.username)
                }

    
            }, i * 1.75 * 1000); 
        });
    }
});

Deno.serve(async (req) => { 
    if(_development) {
        console.log(req.url);
    }

    //********************************************************
    // Let's catch bots first and toss them out if we can...
    //********************************************************
    if((new URLPattern({pathname: "/robots.txt"})).exec(req.url)){
        return new Response(`
            User-agent: *
            Disallow: /
        `, {
            status: 200,
            headers: {
                "content-type": "text/plain",
            },
        });
    }

    const nope = ["robot","spider","facebook","crawler","google","updown.io daemon 2.11","bingbot","bot","duckduckgo"]
    for(let i = 0; i < nope.length; i++) {
        if(!req.headers.get("user-agent") || req.headers.get("user-agent").toLowerCase().includes(nope[i])) {
            return new Response('', {
                status: 401,
            });
        }
    }
    if(req.url == 'https://lillihub.com//wp-includes/wlwmanifest.xml' ||
      req.url == 'https://lillihub.com//xmlrpc.php?rsd' ||
      req.url.includes('wp-content')) {
        return new Response('', {
                status: 404,
            });
    } 

    //********************************************************
    // Okay, let's give the favicon if requested. Otherwise
    // we can run into strange behaviors
    //********************************************************
    if((new URLPattern({ pathname: "/favicon.ico" })).exec(req.url)){
        return new Response(new Uint8Array(await Deno.readFile("static/favicon.ico")), {
            status: 200,
            headers: {
                "content-type": "image/x-icon",
            },
        });
    }

    //********************************************************
    // Now let's give them any common files that the mobile
    // or browser will need for our HTML page
    // - the icon
    // - the webmanifest
    // - the service worker
    // - JS libraries, CSS and font resources
    //********************************************************
    if((new URLPattern({ pathname: "/lillihub-512.png" })).exec(req.url)){
        return new Response(new Uint8Array(await Deno.readFile("static/lillihub-512.png")), {
            status: 200,
            headers: {
                "content-type": "image/png",
            },
        });
    }

    if((new URLPattern({ pathname: "/logo.png" })).exec(req.url)){
        return new Response(new Uint8Array(await Deno.readFile("static/logo-ai-lillihub-xs.png")), {
            status: 200,
            headers: {
                "content-type": "image/png",
            },
        });
    }

    if((new URLPattern({ pathname: "/manifest.webmanifest" })).exec(req.url))
    {
        return new Response(await Deno.readFile("static/manifest.webmanifest"), {
            status: 200,
            headers: {
                "content-type": "text/json",
            },
        });
    }

    if(new URLPattern({ pathname: "/sw.js" }).exec(req.url))
    {
        return new Response(await Deno.readFile("scripts/client/sw.js"), {
            status: 200,
            headers: {
                "content-type": "text/javascript",
            },
        });
    }

    const CHECK_SCRIPT_ROUTE = new URLPattern({ pathname: "/scripts/:id" });
    if(CHECK_SCRIPT_ROUTE.exec(req.url))
    {
        const id = CHECK_SCRIPT_ROUTE.exec(req.url).pathname.groups.id;
        return new Response(await Deno.readFile("scripts/client/" + id), {
            status: 200,
            headers: {
                "content-type": "text/javascript",
            },
        });
    }

    const CHECK_CSS_ROUTE = new URLPattern({ pathname: "/styles/:id" });
    if(CHECK_CSS_ROUTE.exec(req.url))
    {
        const id = CHECK_CSS_ROUTE.exec(req.url).pathname.groups.id;
        return new Response(await Deno.readFile("styles/" + id), {
            status: 200,
            headers: {
                "content-type": "text/css",
            },
        });
    }

    const nonce = crypto.randomUUID(); // this is to protect us from scripts and css
    const CHECK_HTML_ROUTE = new URLPattern({ pathname: "*.html" });
    if(CHECK_HTML_ROUTE.exec(req.url))
    {
        const parts = req.url.split('/');
        return new Response(await Deno.readFile(parts[parts.length - 1]),HTMLHeaders(nonce));
    }

    // const CHECK_FONT_ROUTE = new URLPattern({ pathname: "/font/:id" });
    // if(CHECK_FONT_ROUTE.exec(req.url))
    // {
    //     const id = CHECK_FONT_ROUTE.exec(req.url).pathname.groups.id;

    //     if(id.includes('.eot')) {
    //         return new Response(await Deno.readFile("static/font/" + id), {
    //             status: 200,
    //             headers: {
    //                 "content-type": "application/vnd.ms-fontobject",
    //             },
    //         });
    //     }
    //     if(id.includes('.svg')) {
    //         return new Response(await Deno.readFile("static/font/" + id), {
    //             status: 200,
    //             headers: {
    //                 "content-type": "image/svg+xml",
    //             },
    //         });
    //     }
    //     if(id.includes('.ttf')) {
    //         return new Response(await Deno.readFile("static/font/" + id), {
    //             status: 200,
    //             headers: {
    //                 "content-type": "font/ttf",
    //             },
    //         });
    //     }
    //     if(id.includes('.woff2')) {
    //         return new Response(await Deno.readFile("static/font/" + id), {
    //             status: 200,
    //             headers: {
    //                 "content-type": "font/woff2",
    //             },
    //         });
    //     }
    //     if(id.includes('.woff')) {
    //         return new Response(await Deno.readFile("static/font/" + id), {
    //             status: 200,
    //             headers: {
    //                 "content-type": "font/woff",
    //             },
    //         });
    //     }
    // } // end font route 

    //********************************************************
    // Now let's see if we have a user or if someone needs to 
    // login
    //********************************************************
    const mbTokenCookie = getCookieValue(req, 'atoken');
    const mbToken = mbTokenCookie ? await decryptMe(getCookieValue(req, 'atoken')) : undefined;

    let user = false;
    const following = [];
    if(mbToken) {
        const mbUser = await mb.getMicroBlogUser(mbToken);

        // grab only the info we need
        if(mbUser) {

            if(_development) {
                //console.log(mbUser);
            }

            user = {};
            user.username = mbUser.username;
            user.name = mbUser.name;
            user.avatar = mbUser.avatar;
            user.plan = mbUser.plan;

            //const kv = await Deno.openKv();

            if(new URLPattern({ pathname: "/offline" }).exec(req.url)) {
                return new Response(layout.replaceAll('{{nonce}}', nonce),
                  HTMLHeaders(nonce));
            }

            /********************************
                TIMELINE BASED ROUTES
            *********************************/
            if(new URLPattern({ pathname: "/timeline/reply" }).exec(req.url)) {
                const value = await req.formData();
                const id = value.get('id');
                const replyingTo = value.getAll('replyingTo[]');
                let content = value.get('content');
        
                if(content != null && content != undefined && content != '' && content != 'null' && content != 'undefined') {
                    const replies = replyingTo.map(function (reply, i) { return '@' + reply }).join(' ');
                    content = replies + ' ' + content;
        
                    const posting = await fetch(`https://micro.blog/posts/reply?id=${id}&content=${encodeURIComponent(content)}`, { method: "POST", headers: { "Authorization": "Bearer " + mbToken } });
                    if (!posting.ok) {
                        console.log(`${user.username} tried to add a reply and ${await posting.text()}`);
                    }
        
                    return new Response('Reply was sent.', {
                        status: 200,
                        headers: {
                            "content-type": "text/html",
                        },
                    });
                }
        
                return new Response('Something went wrong sending the reply.', {
                    status: 200,
                    headers: {
                        "content-type": "text/html",
                    },
                });
            }

            if(((new URLPattern({ pathname: "/timeline/discover/feed" })).exec(req.url))) {
                const posts = await mb.getMicroBlogTimelinePosts(_lillihubToken, 0);
                const following = (await mb.getMicroBlogFollowing(mbToken, mbUser.username));
                const html = posts.map(post => {
                    const stranger = following.filter(f => f.username == post.username);
                    const result = postHTML(post, null, stranger.length == 0);
                    return result;
                }).join('');
                return new Response(html,HTMLHeaders(nonce));
            }

            if(((new URLPattern({ pathname: "/timeline/discover/custom" })).exec(req.url))) {
                const posts = await mb.getMicroBlogTimelinePosts(_lillihubToken, 0);
                const following = (await mb.getMicroBlogFollowing(mbToken, mbUser.username));
                const html = posts.map(post => {
                    const stranger = following.filter(f => f.username == post.username);
                    const result = postHTML(post, null, stranger.length == 0);
                    return result;
                }).join('');
                return new Response(html,HTMLHeaders(nonce));
            }

            const DISCOVER_ROUTE = new URLPattern({ pathname: "/timeline/discover/:id" });
            if(((new URLPattern({ pathname: "/timeline/discover" }).exec(req.url)) || DISCOVER_ROUTE.exec(req.url)) && user) {
                let id = '';
                if(DISCOVER_ROUTE.exec(req.url)) {
                    id = DISCOVER_ROUTE.exec(req.url).pathname.groups.id;
                }
                
                const layout = new TextDecoder().decode(await Deno.readFile("discover.html"));
                let fetching = await fetch(`https://micro.blog/posts/discover`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                let results = await fetching.json();
                const tagmojiChips = results._microblog.tagmoji.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)).map((item) =>
                    `<span class="chip ${id && item.name == id ? 'bg-primary' : ''}"><a class="${id && item.name == id ? 'text-secondary' : ''}" href="/timeline/discover/${item.name}">${item.emoji} ${item.title}</a></span>`
                ).join('');
                const tagmojiMenu = results._microblog.tagmoji.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)).map((item) =>
                    `<li class="menu-item ${id && item.name == id ? 'active' : ''}"><a class="${id && item.name == id ? 'text-secondary' : ''}" href="/timeline/discover/${item.name}">${item.emoji} ${item.title}</a></span>`
                ).join('');
                return new Response(layout.replaceAll('{{nonce}}', nonce)
                    .replaceAll('{{tagmojiChips}}', tagmojiChips)
                    .replaceAll('{{tagmojiMenu}}', tagmojiMenu),
                  HTMLHeaders(nonce));
            }

            if((new URLPattern({ pathname: "/timeline/mentions" })).exec(req.url) && user) {
                const layout = new TextDecoder().decode(await Deno.readFile("mentions.html"));
                return new Response(layout.replaceAll('{{nonce}}', nonce),
                  HTMLHeaders(nonce));
            }

            const CHECK_ROUTE = new URLPattern({ pathname: "/timeline/check/:id" });
            if(CHECK_ROUTE.exec(req.url)) {
                const id = CHECK_ROUTE.exec(req.url).pathname.groups.id;
                const fetching = await fetch(`https://micro.blog/posts/check?since_id=${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                const results = await fetching.json(); 
                return new Response(JSON.stringify(results),JSONHeaders());
            }

            const MARK_TIMELINE_ROUTE = new URLPattern({ pathname: "/timeline/mark/:id" });
            if(MARK_TIMELINE_ROUTE.exec(req.url) && user) {
                const id = MARK_TIMELINE_ROUTE.exec(req.url).pathname.groups.id;
                const _posting = await fetch(`https://micro.blog/posts/markers?id=${id}&channel=timeline&date_marked=${new Date()}`, { method: "POST", headers: { "Authorization": "Bearer " + mbToken } });
                return new Response('Timeline marked', {
                    status: 200,
                    headers: {
                        "content-type": "text/html",
                    },
                });
            }

            // this is called from client side JavaScript to get posts
            const POSTS_ROUTE = new URLPattern({ pathname: "/timeline/posts/:id" });
            const TAGMOJI_ROUTE = new URLPattern({ pathname: "/timeline/posts/discover/:id" });
            if((POSTS_ROUTE.exec(req.url) || TAGMOJI_ROUTE.exec(req.url)) && user) {
                const id = POSTS_ROUTE.exec(req.url) ? POSTS_ROUTE.exec(req.url).pathname.groups.id : 'discover/' + TAGMOJI_ROUTE.exec(req.url).pathname.groups.id;
                const posts = await mb.getMicroBlogUserOrTagmojiPosts(mbToken, id);
                const following = (await mb.getMicroBlogFollowing(mbToken, mbUser.username));
                const html = posts.map(post => {
                    const stranger = following.filter(f => f.username == post.username);
                    const result = postHTML(post, null, stranger.length == 0);
                    return result;
                }).join('');
                return new Response(html,HTMLHeaders(nonce));
            }

            const CONVERSATION_ROUTE = new URLPattern({ pathname: "/timeline/conversation/:id" });
            if(CONVERSATION_ROUTE.exec(req.url)) {
                const id = CONVERSATION_ROUTE.exec(req.url).pathname.groups.id;
                const searchParams = new URLSearchParams(req.url.split('?')[1]);
                
                const posts = await mb.getMicroBlogConversation(mbToken, id);  
                const following = (await mb.getMicroBlogFollowing(mbToken, mbUser.username)).map(i => {return JSON.stringify({username: i.username, avatar: i.avatar})});
                        
                const data = {};
                data.ids = posts.map(i => i.id);
                const follows = following.map(f => {return JSON.parse(f)});
        
                data.conversation = `        
                <div class="panel tile-no-sides">
                    <div class="panel-body">
                    ${posts.map(i => {
                        const stranger = follows.filter(f => f.username == i.username);
                        const convo = conversationHTML(i, stranger.length == 0, id, posts.length);
                        return convo;
                    }).join('')}
                    </div>

                    <div class="side-padding">
                        <form class="form" id='replybox-form-${id}' data-id="${id}">
                            <div class="form-group">
                                <label class="form-label" for="replybox-textarea-${id}">Message</label>
                                <div class="grow-wrap"><textarea id="replybox-textarea-${id}" class="form-input grow-me textarea" name="content" rows="3"></textarea></div>
                                <input type="hidden" class="form-input" name="id" value="${id}" />
                            </div>
                            <div class="form-group">
                                <button data-id="${id}" type="button" class="btn btn-primary btn-sm replyBtn">Send Reply</button>
                            </div>
                        </form>
                        <div id="toast-${id}" class="toast hide">
                            <button data-id="${id}" class="btn btn-clear float-right clearToast"></button>
                            <div id="toast-content-${id}">Waiting for server....</div>
                        </div>
                    </div>
                </div>`;

                return new Response(JSON.stringify(data), JSONHeaders());
            }

            const USER_ROUTE = new URLPattern({ pathname: "/timeline/user/:id" });
            if(USER_ROUTE.exec(req.url) && user) {
                const id = USER_ROUTE.exec(req.url).pathname.groups.id;
            
                const results = await mb.getMicroBlogUserOrTagmojiPosts(mbToken, id);
                const follows = await mb.getMicroBlogFollowing(mbToken, mbUser.username);
                const stranger = follows.filter(f => f.username == results.username).length == 0;

                const layout = new TextDecoder().decode(await Deno.readFile("user.html"));

                return new Response(layout.replaceAll('{{results._microblog.username}}', results.username)
                    .replaceAll('{{results.author.name}}',results.name)
                    .replaceAll('{{results.author.url}}',results.url)
                    .replaceAll('{{results._microblog.bio}}', results.bio)
                    .replaceAll('{{posts}}', results.map(post => postHTML(post)).join(''))
                    .replaceAll('{{showIfFollowing}}', !stranger ? '' : 'hide')
                    .replaceAll('{{showIfStranger}}', stranger ? '' : 'hide')
                    ,HTMLHeaders(nonce));
            }

            if(new URLPattern({ pathname: "/timeline/following" }).exec(req.url) && user) {
                let fetching = await fetch(`https://micro.blog/users/following/${user.username}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                let results = await fetching.json();
        
                const users = results.sort((a,b) => (a.username > b.username) ? 1 : ((b.username > a.username) ? -1 : 0)).map((item) =>
                    `<tr>
                        <td><figure class="avatar avatar-lg" data-initial="${item.username.substring(0,1)}">
                                <img src="${item.avatar}" loading="lazy">
                            </figure>
                        </td>
                        <td>
                            <div class="card-title">${item.name}</div>
                            <div class="card-subtitle"><a href="/user/${item.username}" class="text-gray">@${item.username}</a></div>  
                        </td>
                        <td>${item.username.split('@').length == 1 ? '<span class="chip">Micro.blog</span>' : '<span class="chip">Other</span>'}</td>
                    </tr>
                    `
                ).join('');
        
                const layout = new TextDecoder().decode(await Deno.readFile("following.html"));

                return new Response(layout.replaceAll('{{nonce}}', nonce)
                    .replaceAll('{{users}}', users)
                    ,HTMLHeaders(nonce));
            } 

            const TIMELINE_ROUTE = new URLPattern({ pathname: "/timeline/:id" });
            if(TIMELINE_ROUTE.exec(req.url)) {
                const id = TIMELINE_ROUTE.exec(req.url).pathname.groups.id;
                const posts = await mb.getMicroBlogTimelinePosts(mbToken, id);
                const html = posts.map(post => postHTML(post)).join('');

                return new Response(`${html}<br/><p class="p-centered">
                    <button class="btn btn-primary loadTimeline" data-id="${posts[posts.length-1].id}">load more</button>
                    <div id="add-${posts[posts.length-1] ? posts[posts.length-1].id : 'error'}"></div>
                    <div class="hide firstPost" data-id="${posts[0].id}"></div>
                    </p>`,HTMLHeaders(nonce));
            }






            /********************************
                BOOKMARKS BASED ROUTES
            *********************************/
            const READER_ROUTE = new URLPattern({ pathname: "/bookmarks/reader/:id" });
            if(READER_ROUTE.exec(req.url)) {
                const id = READER_ROUTE.exec(req.url).pathname.groups.id;
                // const searchParams = new URLSearchParams(req.url.split('?')[1]);
                // const idsParam = searchParams.get('ids');
                // const title = searchParams.get('title');
            
                let fetching = await fetch(`https://micro.blog/hybrid/bookmarks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                const results = await fetching.text(); 
        
                const page = results;
                // let highlightCount = 0;
                    
                const baseURL = page.split('<base href="')[1].split('"')[0];
                const root = baseURL.split('/');
                root.pop();
                const htmlBody = page.split('<body>')[1].split('</body>')[0];
                let content = htmlBody.split('<div id="content">')[1].split('<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.3/jquery.min.js"></script>')[0];
                content = content.replaceAll('src="',`src="${root.join('/')}/`);
        
                // if(idsParam) {
                //     let ids = [...new Set(idsParam.split(','))];
                //     let allHighlights = await getAllFromMicroBlog('https://micro.blog/posts/bookmarks/highlights', mbToken);
                //     let matchingHighlights = allHighlights.filter((h) => {return ids.includes(h.id.toString());});
                //     highlightCount = matchingHighlights.length;
                //     for(var i = 0; i < matchingHighlights.length; i++) {
                //     var highlight = matchingHighlights[i];
                //     content = content.replaceAll(highlight.content_text,`<mark>${highlight.content_text}</mark>`);
                //     }
                // }
                
                // let script = `

                //     <script nonce=${nonce}>

                //     </script>`;
        
                // fetching = await fetch(`https://micro.blog/posts/bookmarks/tags`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                // const tags = await fetching.json();

                const data = {};
                data.content = content;
                return new Response(JSON.stringify(data), JSONHeaders());
            }
        
            if(new URLPattern({ pathname: "/bookmarks/highlights" }).exec(req.url)) {
                const nonce = crypto.randomUUID();
                const allHighlights = await mb.getAllFromMicroBlog(mbToken, 'https://micro.blog/posts/bookmarks/highlights');
                return new Response(`<textarea rows="20">${JSON.stringify(allHighlights)}</textarea>`,HTMLHeaders(nonce));
            }

            if(new URLPattern({ pathname: "/bookmarks/bookmarks" }).exec(req.url)) {
                const searchParams = new URLSearchParams(req.url.split('?')[1]);
                const tag = searchParams.get('tag');
                const items = await mb.getAllFromMicroBlog(mbToken, `https://micro.blog/posts/bookmarks${tag ? `?tag=${tag}` : ''}`);
                const allHighlights = await mb.getAllFromMicroBlog(mbToken, 'https://micro.blog/posts/bookmarks/highlights');

                for(let i=0; i< items.length; i++) {
                    const item = items[i];
                    const highlights = allHighlights.filter(h => h.url === item.url);
                    
                    item.title = item.content_html.split('</p>')[0].replace('<p>','');
                    item.reader = item._microblog.links && item._microblog.links.length > 0 ? item._microblog.links[0].id : null;
                    item.highlights = highlights && highlights.length > 0 ? highlights.map(h => h.id) : [];
                }
                return new Response(items.map(b => utility.bookmarkHTML(b)).join(''),HTMLHeaders(nonce));
            }
        
            if(new URLPattern({ pathname: "/bookmarks" }).exec(req.url)) {        
                // let bookmarks = [];
                // const fetching = await fetch(`https://micro.blog/posts/bookmarks/tags`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                // const tags = await fetching.json();
                // let tagDatalist = `<datalist id="bookmarkTags">${user && user.is_premium && tags && tags.length > 0 ? `
                //     ${tags.sort().map(t => `<option value="${t}"></option>`).join('')}`  : ''}</datalist>
                // ${user && user.is_premium && tags && tags.length > 0 ? `
                //     ${tags.sort().map(t => `<span class="chip ${tag == t ? 'bg-primary' : ''}"><a ${tag == t ? 'class="text-light"' : ''} href="/bookmarks?tag=${t}">${t}</a></span>`).join('')}`  : ''}`;
        
                // return new Response(await HTML(`              
                // 

                const layout = new TextDecoder().decode(await Deno.readFile("bookmarks.html"));
                return new Response(layout.replaceAll('{{nonce}}', nonce),HTMLHeaders(nonce));
            }
        
            if(new URLPattern({ pathname: "/bookmarks/new" }).exec(req.url)) {
                const value = await req.formData();
                const url = value.get('url');
        
                const formBody = new URLSearchParams();
                formBody.append("h", "entry");
                formBody.append("bookmark-of", url);
        
                const posting = await fetch(`https://micro.blog/micropub`, {
                    method: "POST",
                    body: formBody.toString(),
                    headers: {"Content-Type": "application/x-www-form-urlencoded; charset=utf-8","Authorization": "Bearer " + mbToken}
                });
                let message = 'bookmark added';
                if (!posting.ok) {
                    message = await posting.text();
                    console.log(`${user.username} tried to add a bookmark ${url} and ${message}`);
                }
                return new Response(message, {
                    status: 200,
                    headers: {
                        "content-type": "text/html",
                    },
                });
            }








            /********************************
                NOTES BASED ROUTES
            *********************************/




            const NOTEBOOK_FETCH_ROUTE = new URLPattern({ pathname: "/notebooks/notebooks/:id" });
            if(NOTEBOOK_FETCH_ROUTE.exec(req.url)) {
                let fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                let results = await fetching.json();

                let id = NOTEBOOK_FETCH_ROUTE.exec(req.url).pathname.groups.id;
                if(id == 0) {
                    id = results.items[0].id;
                }
                
                fetching = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                results = await fetching.json();
                //console.log(results.items);
                return new Response(JSON.stringify(results.items.map(i => {i.notebook_id = id; return i;})), JSONHeaders());
                //return new Response(results.items.map(i => utility.noteHTML(i, id)).join(''),HTMLHeaders(nonce));
            }

            // const NOTEBOOK_ROUTE = new URLPattern({ pathname: "/notebooks/:id" });
            // if(new URLPattern({ pathname: "/notebooks" }).exec(req.url) || NOTEBOOK_ROUTE.exec(req.url)) {
            //     let fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
            //     let results = await fetching.json();

            //     let id = results.items[0].id;
            //     if(NOTEBOOK_ROUTE.exec(req.url)) {
            //         id = NOTEBOOK_ROUTE.exec(req.url).pathname.groups.id;
            //     }

            //     const layout = new TextDecoder().decode(await Deno.readFile("notebooks.html"));
            //     const notebooks = results.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map((item) =>
            //         `<li class="menu-item"><a class="notebook-${item.id}" href="/notebooks/${item.id}">${item.title}</a></span>`
            //     ).join('');
            //     return new Response(layout.replaceAll('{{nonce}}', nonce)
            //         .replaceAll('{{notebooks}}', notebooks)
            //         .replaceAll('{{notebookId}}', id),
            //         HTMLHeaders(nonce));
            // }




















            if(((new URLPattern({ pathname: "/settings" })).exec(req.url))) {
                const layout = new TextDecoder().decode(await Deno.readFile("settings.html"));
                return new Response(layout.replaceAll('{{nonce}}', nonce)
                      .replace('{{year}}', new Date().getFullYear()),
                  HTMLHeaders(nonce));
            }


            // Here we have the reply and posting functionality


            if((new URLPattern({ pathname: "/post/add" })).exec(req.url) && user) {
                const value = await req.formData();
                const destination = value.get('destination');
                const syndicates = value.getAll('syndicate[]');
                const categories = value.getAll('category[]');
                let content = value.get('content');
                const status = value.get('status');
                const name = value.get('name');
                const replyingTo = value.getAll('replyingTo[]');
                const postingType = value.get('postingType');
                const omgApi = value.get('omgApi');
                const omgAddess = value.get('omgAddess');
                const indieToken = value.get('indieToken');
                const microPub = value.get('microPub');

                const replies = replyingTo.map(function (reply) { return '@' + reply }).join(', ');
                content = replies + ' ' + content;

                if(!postingType || postingType === 'mb') {
                    const formBody = new URLSearchParams();
                    formBody.append("mp-destination", destination);
                    formBody.append("h", "entry");
                    formBody.append("content", content);
                   
                    if(name){
                        formBody.append("name", name);
                    }
                    if(categories.length > 0) {
                        categories.forEach((item) => formBody.append("category[]", item));
                    }
                    if(status == 'draft'){
                        formBody.append("post-status", "draft");
                    }
                    if(syndicates.length > 0) {
                        syndicates.forEach((item) => formBody.append("mp-syndicate-to[]", item));
                    } else {
                        formBody.append("mp-syndicate-to[]", "");
                    }
                    
                    const posting = await fetch(`https://micro.blog/micropub`, { method: "POST", body: formBody.toString(), headers: { "Authorization": "Bearer " + mbToken, "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" } });
                    if (!posting.ok) {
                        console.log(`${user.username} tried to add a post and ${await posting.text()}`);
                    }
                    return new Response(JSON.stringify({"response":{"message":"Post was sent."}}), JSONHeaders());

                } else if(postingType === 'statuslog') {
                    const posting = await fetch(`https://api.omg.lol/address/${omgAddess}/statuses/`, { method: "POST", body: JSON.stringify({"status": content}), headers: { "Authorization": "Bearer " + omgApi } });
                    if (!posting.ok) {
                        console.log(`${user.username} tried to add a post and ${await posting.text()}`);
                    }
                    const data = await posting.json(); 
                    return new Response(JSON.stringify(data), JSONHeaders());

                } else if(postingType === 'weblog') {
                    const posting = await fetch(`https://api.omg.lol/address/${omgAddess}/weblog/entry/abc123`, { method: "POST", body: content, headers: { "Authorization": "Bearer " + omgApi } });
                    if (!posting.ok) {
                        console.log(`${user.username} tried to add a post and ${await posting.text()}`);
                    }
                    const data = await posting.json(); 
                    return new Response(JSON.stringify(data), JSONHeaders());
                }
                
        
                //return Response.redirect(req.url.replaceAll('/post/add', status == 'draft' ? `/blog?status=draft&destination=${destination}` : `/blog?status=published&destination=${destination}`));
            }



            if((new URLPattern({ pathname: "/timeline" })).exec(req.url) && user) {
                const layout = new TextDecoder().decode(await Deno.readFile("timeline.html"));
                const following = (await mb.getMicroBlogFollowing(mbToken, mbUser.username)).map(i => {return JSON.stringify({username: i.username, avatar: i.avatar})});
                return new Response(layout.replaceAll('{{nonce}}', nonce)
                      .replace('{{username}}', mbUser.username)
                      .replace('{{replyBox}}', getReplyBox('main',following, true)),
                  HTMLHeaders(nonce));
            }


            
            // -----------------------------------------------------
            // API endpoints
            // -----------------------------------------------------
            if(new URLPattern({ pathname: "/api/notebooks" }).exec(req.url)) {
                let fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                let results = await fetching.json();
                return new Response(JSON.stringify(results),
                    JSONHeaders());   
            }

            const NOTEBOOK_API_FETCH_ROUTE = new URLPattern({ pathname: "/api/notebooks/:id" });
            if(NOTEBOOK_API_FETCH_ROUTE.exec(req.url)) {
                let id = NOTEBOOK_API_FETCH_ROUTE.exec(req.url).pathname.groups.id;
                let fetching = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                let results = await fetching.json();
                return new Response(JSON.stringify(results.items.map(i => {i.notebook_id = id; return i;})), JSONHeaders());
            }

            // -----------------------------------------------------
            // All other pages
            // -----------------------------------------------------
            const pages = ["notebooks"]
            if (pages.some(v => req.url.includes(v))) {
                const layout = new TextDecoder().decode(await Deno.readFile("layout.html"));
                const parts = req.url.split('/');
                let name = parts[parts.length - 1].split('?')[0];
                let id = null;
                let content = '';

                // get notebooks for sidebar
                let fetching = await fetch(`https://micro.blog/notes/notebooks`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                const notebooks = await fetching.json();

                // check for notebooks route
                if(req.url.includes("notebooks"))
                {
                    id = name;
                    name = "notebooks";
                    fetching = await fetch(`https://micro.blog/notes/notebooks/${id}`, { method: "GET", headers: { "Authorization": "Bearer " + mbToken } } );
                    const notes = await fetching.json();
                    content = notes.map(n => utility.noteHTML(n)).join('');
                }
                
                return new Response(layout.replaceAll('{{nonce}}', nonce)
                    .replaceAll('{{pages}}', content)
                    .replaceAll('{{notebooks}}', notebooks.items.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0)).map(element => {
                        `<li class="menu-item"><a class="notebook-${element.id}" href="/notebooks/${element.id}" swap-target="#main" swap-history="true">${element.title}</a></li>`}).join(''))
                    .replaceAll('{{pageName}}', name ? String(name).charAt(0).toUpperCase() + String(name).slice(1) : '')
                    .replaceAll('{{scriptLink}}', name ? `` : '')
                    //.replaceAll('{{scriptLink}}', name ? `<script src="/scripts/${name}.js" type="text/javascript"></script>` : '')
                , HTMLHeaders(nonce));
            }

            return new Response(new TextDecoder().decode(await Deno.readFile("notfound.html")),
            {
                headers: {
                    "content-type": "text/html",
                    status: 404,
                },
            });

        } else {
            return returnBadGateway('Micro.blog did not return a user from the provided token.')
        }
    } else {
        // -----------------------------------------------------
        // We don't have a user, they can only see the homepage,
        // and the authentication routes
        // -----------------------------------------------------
        
        // Is it the redirect back from indieauth?
        if(new URLPattern({ pathname: "/auth" }).exec(req.url)) {
            const stateCookie = getCookieValue(req, 'state');
            const searchParams = new URLSearchParams(req.url.split('?')[1]);
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            if(_development) {
                console.log(`code: ${code}, state: ${state} == ${stateCookie}`);
            }
    
            if(code && stateCookie == state) {
                const formBody = new URLSearchParams();
                formBody.append("code", code);
                formBody.append("client_id", req.url.split('?')[0].replaceAll('auth',''));
                formBody.append("grant_type", "authorization_code");
    
                const fetching = await fetch('https://micro.blog/indieauth/token', {
                    method: "POST",
                    body: formBody.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                        "Accept": "application/json"
                    }
                });

                const response = await fetching.json();
                
                if(!response.error && response.access_token) {
                  const expiresOn = new Date();
                  const accessToken = await encryptMe(response.access_token);
                  expiresOn.setDate( expiresOn.getDate() + 399); //chrome limits to 400 days
                                    
                  const layout = new TextDecoder().decode(await Deno.readFile("loggingIn.html"));
                  return new Response(layout.replaceAll('{{nonce}}', nonce)
                        .replace('{{year}}', new Date().getFullYear()),
                    HTMLHeaders(nonce,`atoken=${accessToken};SameSite=Lax;Secure;HttpOnly;Expires=${expiresOn.toUTCString()}`));
                }

                return returnBadGateway(`Micro.blog indieauth did not return a token. ${response.error} ${response.access_token}`); 
            }
            return new Response(`Something went wrong. No code returned or state does not match cookie value.`,HTMLHeaders()); 
        } 
        
        // Is it the homepage?
        else if((new URLPattern({ pathname: "/" })).exec(req.url))
        {
            const layout = new TextDecoder().decode(await Deno.readFile("signin.html"));
            const state = crypto.randomUUID();
            return new Response(
                layout.replace('{{nonce}}', nonce)
                    .replace('{{state}}', state)
                    .replaceAll('{{appURL}}', req.url.endsWith('/') ? req.url.slice(0, -1) : req.url)
                    .replace('{{year}}', new Date().getFullYear()),
                HTMLHeaders(nonce, `state=${state};HttpOnly;`)
            );
        } else {
            return new Response('', {
                status: 404,
            });
        }
    }
});


//********************************************************
// Helper functions... a developer's best friend
// - getCookieValue: get value from a cookie
// - encryptMe: encrypt a string
// - decryptMe: decrypt a string
// - HTMLHeaders: proper csp protected headers
// - returnBadGateway: response if we have a bad API call
//********************************************************

// Takes a request, gets the cookies, and looks for one 
// that has the passed in name. If found, it returns...
// otherwise it returns an empty string.
function getCookieValue(req, name) {
    const cookies = req.headers.get("cookie") ? req.headers.get("cookie").split('; ') : [];
    let cookieValue = cookies.filter(cookie => cookie.includes(`${name}=`));
    cookieValue = cookieValue.length > 0 ? cookieValue[0].split('=')[1] : '';
    return cookieValue;
}

// Takes a decrypted string and then encrypts it with our secret value
// Uses AES-CBC. Returns and array of comma seperated integers.
async function encryptMe(decrypted)
{
    const iv = await crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey("jwk", _appSecret, "AES-CBC", true, ["encrypt", "decrypt"]);
    const encrypted = await crypto.subtle.encrypt({name: "AES-CBC", iv}, key, new TextEncoder().encode(decrypted));
    const encryptedBytes = new Uint8Array(encrypted);

    return `${iv.toString()}|${encryptedBytes.toString()}`;
}

// Takes an encrypted string, with our secret, and then descrypts it.
// Returns the decrypted string
async function decryptMe(encrypted)
{
    const key = await crypto.subtle.importKey("jwk", _appSecret, "AES-CBC", true, ["encrypt", "decrypt"]);
    const ivPart = encrypted.split('|')[0];
    const encryptedPart = encrypted.split('|')[1];

    const encryptedBytes = Uint8Array.from(encryptedPart.split(',').map(num => parseInt(num)));
    const iv = Uint8Array.from(ivPart.split(',').map(num => parseInt(num)));
   
    const decrypted = await crypto.subtle.decrypt({name: "AES-CBC", iv}, key, encryptedBytes);
    const decryptedBytes = new Uint8Array(decrypted);
    return new TextDecoder().decode(decryptedBytes);
}

// Helper method for returning a proper response header
// can set a cookie if provided
// the uuid is set per request to set a nonce
function HTMLHeaders(uuid, cookie) {
    const csp = `default-src 'self' micro.blog *.micro.blog *.gravatar.com 'nonce-${uuid}';media-src *;img-src *`;
    if(!cookie) {
        return {
            headers: {
                "content-type": "text/html",
                status: 200,
                "Content-Security-Policy": csp
            },
        };
    }
    return {
        headers: {
            "content-type": "text/html",
            status: 200,
            "set-cookie": cookie,
            "Content-Security-Policy": csp
        },
    };
}

function JSONHeaders() {
    return {
        headers: {
            "content-type": "text/json",
            status: 200,
        },
    };
}

// Helper method to return a bad gateway and the reason.
function returnBadGateway(reason) {
    return new Response(reason, {
        status: 502,
        "content-type": "text/html"
    });
}

function getAvatar(p, size) {
    return `<figure class="avatar ${size}" data-initial="${p.username.substring(0,1)}">
            <img src="${p.avatar}" loading="lazy">
        </figure>`;
}

function postHTML(post, marker, stranger) {
    const multipleImgs = !post.linkpost && post.content.split('<img').length > 2;

    if(multipleImgs) {
        post.content = post.content.replaceAll('<img', `<img data-gallery='${post.id}'`);
    }

    // const anchors = post.content.split('<a');
    // if(anchors && anchors.length > 1) {
    //     for(let i = 0; i < anchors.length; i++) {
    //         if(!anchors[i].includes('@') && anchors[i].includes('href=')) {
    //             //onst anchor = anchors[i].split('</a>')[0];
    //             let href = anchors[i].replaceAll("'",'"').split('href="');
    //             //console.log('Anchor:')
    //             //console.log(anchors[i])
    //             if(href[1]) {
    //                 href = href[1].split('"')[0];
    //                 // console.log(href)
    //                 const previewbox = `<previewbox-link dark href="${href}"></previewbox-link>`;
    //                 console.log(previewbox);
    //                 post.content = post.content + previewbox;
    //                 // var username = href[1].split('"')[0].replace('https://micro.blog/','');
    //                 // post.content = post.content.replaceAll(anchor, '/user/' + username);
    //             }
    //         } 
    //         // if(anchors[i].includes('https://micro.blog/') && anchors[i].includes('@')) {
    //         //     var href = anchors[i].replaceAll("'",'"').split('href="');
    //         //     if(href[1]) {
    //         //         var anchor = href[1].split('"')[0];
    //         //         var username = href[1].split('"')[0].replace('https://micro.blog/','');
    //         //         post.content = post.content.replaceAll(anchor, '/user/' + username);
    //         //     }
    //         // } 

    //         //<previewbox-link href="https://web-highlights.com"></previewbox-link>
    //     }
    // }
    
    post.content.replaceAll('<script', `<div`);
    post.content.replaceAll('</script', `</div`);
    
    //${marker && marker.time_published && (marker.time_published >= post.timestamp) ? 'seen' : ''}
    return `
        <article id="${post.id}" class="openConversationBtn card ripple parent ${marker && marker.id == post.id ? 'marked' : ''}" data-reply="${post.username}" data-avatar="${post.avatar}" data-id="${post.id}" data-processed="false" data-marked="${marker && marker.id == post.id ? 'true' : 'false'}" data-url="${post.url}" data-mention="${post.mention}" data-conversation="${post.conversation}" data-timestamp="${post.timestamp}" data-published="${post.published}" data-deletable="${post.deletable}" data-linkpost="${post.linkpost}" data-bookmark="${post.bookmark}" data-favorite="${post.favorite}">
            <header class="card-header">
                ${getAvatar(post, 'avatar-lg')}
                <div class="card-top">
                    <div class="card-title h5">${post.name}</div>
                    <div class="card-subtitle">
                        <a href="/timeline/user/${post.username}" class="text-gray">
                            ${stranger ? '<i class="icon icon-people text-gray"></i> ' : ''}
                            @${post.username}
                        </a> · 
                        <a target="_blank" href="${post.url}" class="text-gray">${post.relative}</a>
                        ${post.conversation && !post.mention ? '&nbsp;·&nbsp;<i class="icon icon-message text-gray"></i>' : ''}
                    </div>           
                </div>
                <!--<div class="card-buttons">
                    <div class="dropdown dropdown-right"><a class="btn btn-link dropdown-toggle" tabindex="0"><i class="icon icon-more-vert"></i></a>
                        <ul class="menu">
                            <li class="divider" data-content="Published: ${post.relative}">
                            <li class="menu-item"><a href="/post?quote=${post.id}" class="btn-link btn">Quote Post</a></li>
                            <li class="menu-item"><button data-url="${post.url}" class="addBookmark btn-link btn">Bookmark Post</button></li>
                            <li class="menu-item"><a href="/conversation/${post.id}?view=true" class="btn-link btn">View Post</a></li>
                        </ul>
                    </div>
                </div>-->
            </header>
            <main id="main-${post.id}" data-id="${post.id}">${post.content}</main>
            ${multipleImgs ? `<div data-id="${post.id}" class='gallery'></div>` : ''}
        </article>
    `;
}

function conversationHTML(post, stranger, parent, length) {
    const p = post;

    const multipleImgs = !p.linkpost && p.content.split('<img').length > 2;

    if(multipleImgs) {
        p.content = p.content.replaceAll('<img', `<img data-gallery='${p.id}-${parent}'`);
    }
    return `
        <div class="tile mb-2 mt-2 pt-2 ${p.id == parent ? 'highlight' : ''}" id="convo-${p.id}-${parent}" data-id="${p.id}" data-parent="${parent}" data-stranger="${stranger}">
            <div class="tile-icon ">
                <figure class="avatar avatar-lg" data-initial="${p.username.substring(0,1)}">
                    <img src="${p.avatar}" loading="lazy">
                </figure>
            </div>
            <div class="tile-content">
                <p class="tile-title">
                    ${p.name} <a class="text-gray" href="/timeline/user/${p.username}">@${p.username}</a>
                    <br/><a class="text-gray" href="${p.url}">${p.relative}</a>${stranger ? ' <i class="icon icon-people text-gray"></i>' : ''}
                    <button type="button" class="addToReply btn btn-sm btn-link btn-icon float-right" data-target="replybox-textarea-${parent}" data-id="${p.username}">
                        <i data-target="replybox-textarea-${parent}" data-id="${p.username}" class="icon icon-share addToReply"></i>
                    </button>
                </p>
                ${p.content}
                ${multipleImgs ? `<div data-id="${p.id}-${parent}" class='gallery'></div>` : ''}
            </div>
        </div>
    `;
}

function getReplyBox(id, repliers, boxOnly = false) {  
    if(boxOnly) {
        return `<div id="replybox-${id}" class="form-group">
                    <div class="form-autocomplete">
                    <div id="replybox-input-container-${id}" class="form-autocomplete-input form-input">
                        <div id="replybox-chips-${id}">
                        </div>
                        <input id="replybox-input-${id}" data-id="${id}" class="form-input replierInput" type="text" placeholder="Begin typing to find users" value="">
                    </div>
                    <ul id="replybox-menu-${id}" class="menu hide">
                        ${repliers.map(r => {
                            const replier = JSON.parse(r);
                            return `<li class="menu-item" class="hide" data-name="${replier.username}" data-avatar="${replier.avatar}"></li>`}).join('')}
                    </ul>
                    </div>
                </div>
                ${repliers.map(function (ur) {
                    const person = JSON.parse(ur);
                    return `<input id="replybox-checkbox-${id}-${person.username}" class="hide" type='checkbox' name='replyingTo[]' value='${person.username}'/>`
                }).join(' ')}
                `;
    }
    const author = JSON.parse(repliers[0]);
    return `
        <form class="form" id='replybox-form-${id}' data-id="${id}">
            ${repliers.map(function (ur) {
                const person = JSON.parse(ur);
                return `<input id="replybox-checkbox-${id}-${person.username}" class="hide" ${person.username.trim() == author.username.trim() ? 'checked="checked"' : ''} type='checkbox' name='replyingTo[]' value='${person.username}'/>`
            }).join(' ')}
            <div id="replybox-${id}" class="form-group">
                <label class="form-label">Repling to:</label>
                <div class="form-autocomplete">
                <div id="replybox-input-container-${id}" class="form-autocomplete-input form-input">
                    <div id="replybox-chips-${id}">
                        <span id="chip-${id}-${author.username}" class="chip"><img class="avatar avatar-sm" src="${author.avatar}" />@${author.username}<a data-name="${author.username}" data-id="${id}" class="btn btn-clear replierRemoveChip" href="#" aria-label="Close" role="button"></a></span>
                    </div>

                    <input id="replybox-input-${id}" data-id="${id}" class="form-input replierInput" type="text" placeholder="" value="">
                </div>
                <ul id="replybox-menu-${id}" class="menu hide">
                    ${repliers.map(r => {
                        const replier = JSON.parse(r);
                        return `<li class="menu-item" class="hide" data-name="${replier.username}" data-avatar="${replier.avatar}"></li>`}).join('')}
                </ul>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="input-example-3">Message</label>
                <div class="grow-wrap"><textarea id="replybox-textarea-${id}" class="form-input grow-me" name="content" rows="3"></textarea></div>
                <input type="hidden" class="form-input" name="id" value="${id}" />
            </div>
            <div class="form-group">
                <button data-id="${id}" type="button" class="btn btn-primary replyBtn">Send Reply</button>
            </div>
        </form>
    `;
}