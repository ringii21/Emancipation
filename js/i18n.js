/* i18n — dictionnaires d'interface, copiés de demo/index.html.
   FRUI : français. JA.ui : japonais. Toute chaîne visible passe par eux ;
   toute nouvelle chaîne s'ajoute dans les DEUX dictionnaires.
   JA.W (surcharges japonaises des semaines) est rempli au démarrage
   depuis data/weeks.ja.json (js/app.js). */

/* ══════ Interface — français ══════ */
var FRUI={
 eyebrow:"Charles Haanel · 1912",h1:'La Clé<br><em>maîtresse</em>',
 navKey:"La Clé",navJournal:"Carnet",navPensees:"Pensées",navSoon:"Suite",
 jEyebrow:"Ce que tu as observé",jH1:'Le <em>carnet</em>',
 pnEyebrow:"Exercices d'auto-observation",pnH1:'Pensées <em>constructives</em>',
 pnStart:"Commencer",pnStop:"Mettre en pause",pnQuit:"Quitter",
 pnNext:"Suivant",pnBack:"Retour",pnFinish:"Terminer",
 pnSave:"Enregistrer dans le carnet",pnSkip:"Facultatif.",pnDelete:"Supprimer",pnDone:"Terminé",
 pnCarnet:"Ton carnet",pnEmpty:"Rien d'enregistré pour l'instant. Tu peux garder une trace d'un exercice, si tu veux ; rien n'y oblige, et ce que tu écris reste sur ce téléphone.",
 pnChoisir:"Choisis un état, ou écris une phrase.",pnEnvoyer:"Voir ce qui pourrait aider",
 pnSensCount:n=>`${n} chose${n>1?'s':''}`,
 sEyebrow:"En construction",sH1:'La <em>suite</em>',soonTag:"bientôt",
 soonBody:"<p>Le refuge, le rituel du matin, les exercices pour couper une habitude et l'onglet Gourmet arrivent ensuite.</p><p>On construit un module à la fois, dans l'ordre. C'est le principe.</p>",
 start0:"24 semaines, 168 séances. Une par jour. La première commence quand tu veux.",
 day:(t,c)=>`Jour ${t} sur 168 · semaine ${c} sur 24`,
 wk:c=>`Semaine ${c} · en cours`, src:"La Clé de la Maîtrise, 1912",
 doneToday:"Séance faite aujourd'hui", again:"Refaire une séance",
 begin:d=>`Commencer la séance ${d} sur 7`,
 reread:lp=>`Relire la leçon · ${lp} lecture${lp>1?'s':''} cette semaine`,
 resume:(p,P)=>`Reprendre la lecture · ${p} sur ${P}`,
 readIt:P=>`Lire la leçon · ${P} paragraphes commentés`,
 whatMeans:"Ce que ça veut dire", whatSays:"Ce que ça dit",
 doneHead:"Terminées", lockHead:"Verrouillées", sess:n=>`${n} séances`,
 lockNote:"Chaque semaine s'ouvre après 7 séances de la précédente. C'est la consigne de Haanel lui-même : ne pas avancer avant d'avoir maîtrisé l'étape en cours.",
 jEmpty:"Après chaque séance tu peux noter une ligne sur ce que tu as remarqué. Rien n'est obligatoire. Ce que tu écris reste sur ton téléphone.",
 quit:"← Quitter", next:"Suivant", finish:"Terminer", partDone:"Partie terminée",
 rereadStart:"Relire depuis le début",
 doneH:t=>`Tu as lu la ${t} en entier.`,
 doneP1:'Haanel ne demande pas de passer à la suite. Il demande de <strong style="color:var(--paper);font-weight:400">relire cette même partie</strong> pendant les sept jours, jusqu\'à en avoir assimilé le sens.',
 doneP2:"Deux ou trois relectures dans la semaine suffisent. La séance de 15 minutes, elle, reste quotidienne.",
 loops:(l,p)=>`${l<=1?'1ʳᵉ lecture faite':l+'ᵉ lecture faite'} · semaine ${p}`,
 exoTag:"L'exercice de la semaine", sessDone:"Séance terminée.",
 sessAsk:"Une ligne, si tu veux. Qu'est-ce que tu as remarqué ?", save:"Enregistrer", skip:"Passer",
 startBtn:"Commencer", stopBtn:"Mettre en pause", quitSess:"Quitter la séance",
 langLabel:"日本語", frOnly:"", listenLbl:"Écouter la consigne", counter:(n,i,N)=>`§${n} · ${i} sur ${N}`,
 notWritten:"La lecture commentée de cette partie n'est pas encore écrite.",
 loadFail:"Les données n'ont pas pu être chargées. Vérifie la connexion, puis recharge la page."
};

/* ══════ 日本語 — 1912年英語原典より翻訳 ══════ */
var JA={
ui:{
 eyebrow:"チャールズ・ハアネル · 1912",h1:'ザ・マスター<br><em>キー</em>',
 navKey:"鍵",navJournal:"手帳",navPensees:"考え",navSoon:"続き",
 jEyebrow:"気づいたこと",jH1:'<em>手帳</em>',
 pnEyebrow:"自分を観察する練習",pnH1:'建設的な<em>考え</em>',
 pnStart:"開始",pnStop:"一時停止",pnQuit:"やめる",
 pnNext:"次へ",pnBack:"戻る",pnFinish:"終える",
 pnSave:"手帳に残す",pnSkip:"任意。",pnDelete:"削除",pnDone:"終わり",
 pnCarnet:"あなたの手帳",pnEmpty:"まだ何も残っていません。よければエクササイズの記録を残せます。義務ではありませんし、書いたものはこの端末の中だけに残ります。",
 pnChoisir:"状態を選ぶか、一言書いてください。",pnEnvoyer:"役に立ちそうなものを見る",
 pnSensCount:n=>`${n}つ`,
 sEyebrow:"準備中",sH1:'この<em>先</em>',soonTag:"近日",
 soonBody:"<p>拠り所、朝の習慣、習慣を断つための練習、そしてグルメのタブが、このあとに続きます。</p><p>一度にひとつずつ、順番に作っていきます。それが方針です。</p>",
 start0:"24週間、168回のセッション。1日1回。最初の1回は、いつ始めてもかまいません。",
 day:(t,c)=>`168日のうち${t}日目 · 24週のうち第${c}週`,
 wk:c=>`第${c}週 · 実施中`, src:"『ザ・マスター・キー・システム』1912",
 doneToday:"今日のセッションは完了", again:"もう一度おこなう",
 begin:(d)=>`セッションを始める（7回中${d}回目）`,
 reread:(lp)=>`レッスンを読み返す · 今週${lp}回目`,
 resume:(p,P)=>`続きから読む · ${P}中${p}`,
 readIt:P=>`レッスンを読む · 解説つき${P}段落`,
 whatMeans:"これはどういう意味か", whatSays:"ここで言っていること",
 doneHead:"完了", lockHead:"未開放", sess:n=>`あと${n}回`,
 lockNote:"各週は、前の週のセッションを7回終えると開きます。これはハアネル自身の指示です——いまの段階を習得するまで先へ進まないこと。",
 jEmpty:"セッションのあと、気づいたことを一行だけ書き残せます。義務ではありません。書いたものはこの端末の中だけに残ります。",
 quit:"← 出る", next:"次へ", finish:"終える", partDone:"この部を読み終えました",
 rereadStart:"最初から読み返す",
 doneH:t=>`${t}を最後まで読みました。`,
 doneP1:'ハアネルは次へ進めとは言いません。<strong style="color:var(--paper);font-weight:400">同じ部を読み返す</strong>ことを求めます。七日のあいだ、意味が身につくまで。',
 doneP2:"週に二、三回の読み返しで足ります。15分のセッションのほうは、毎日です。",
 loops:(l,p)=>`${l<=1?'1回目':l+'回目'}の通読 · 第${p}週`,
 exoTag:"今週の練習", sessDone:"セッション終了。",
 sessAsk:"何に気づきましたか？", save:"手帳に残す", skip:"書かずに閉じる",
 startBtn:"開始", stopBtn:"中止", quitSess:"セッションを終える",
 langLabel:"FR", frOnly:"", listenLbl:"指示を聞く", counter:(n,i,N)=>`§${n} · ${N}中${i}`,
 notWritten:"この部の解説つきレッスンは、まだ書かれていません。",
 loadFail:"データを読み込めませんでした。接続を確認してから、ページを再読み込みしてください。"
},
W:null /* rempli au démarrage depuis data/weeks.ja.json */
};
