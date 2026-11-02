// The SDK is loaded only when Firebase is configured; guest creation needs no account.
let auth,db,authSDK,dbSDK,config,calendarToken;
export async function initCloud(onUser){
  const response=await fetch('/firebase-config.json',{cache:'no-store'});if(!response.ok)return false;
  config=await response.json();if(!config.apiKey||!config.projectId)return false;
  const [appSDK,a,d]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js')]);
  authSDK=a;dbSDK=d;const app=appSDK.initializeApp(config);auth=a.getAuth(app);db=d.getFirestore(app);a.onAuthStateChanged(auth,user=>{calendarToken=null;onUser(user);});return true;
}
function ready(){if(!auth)throw Error('Cloud accounts are not connected yet. You can create, save on this device, export, and share cards as a guest.');}
export async function login(email,password,create=false){ready();if(!email){const p=new authSDK.GoogleAuthProvider();return authSDK.signInWithPopup(auth,p);}return create?authSDK.createUserWithEmailAndPassword(auth,email,password):authSDK.signInWithEmailAndPassword(auth,email,password);}
export async function logout(){ready();calendarToken=null;return authSDK.signOut(auth);}
export async function resetPassword(email){ready();return authSDK.sendPasswordResetEmail(auth,email);}
export async function cloudSave(card){ready();if(!auth.currentUser)throw Error('Sign in to save across devices.');const {doc,setDoc,serverTimestamp}=dbSDK;return setDoc(doc(db,'users',auth.currentUser.uid,'cards',card.id),{payload:JSON.stringify(card),updatedAt:serverTimestamp()});}
export async function cloudList(){ready();if(!auth.currentUser)return [];const {collection,getDocs,query,limit}=dbSDK;const r=await getDocs(query(collection(db,'users',auth.currentUser.uid,'cards'),limit(200)));return r.docs.map(d=>{try{return JSON.parse(d.data().payload);}catch{return null;}}).filter(Boolean);}
export async function cloudDelete(id){ready();if(!auth.currentUser)throw Error('Sign in first.');return dbSDK.deleteDoc(dbSDK.doc(db,'users',auth.currentUser.uid,'cards',id));}
export async function cloudSaveProfile(profile){ready();if(!auth.currentUser)throw Error('Sign in first.');return dbSDK.setDoc(dbSDK.doc(db,'users',auth.currentUser.uid,'people',profile.id),{payload:JSON.stringify(profile),updatedAt:dbSDK.serverTimestamp()});}
export async function cloudProfiles(){ready();if(!auth.currentUser)return [];const r=await dbSDK.getDocs(dbSDK.query(dbSDK.collection(db,'users',auth.currentUser.uid,'people'),dbSDK.limit(200)));return r.docs.flatMap(d=>{try{return [JSON.parse(d.data().payload)];}catch{return [];}});}
export async function cloudDeleteProfile(id){ready();if(!auth.currentUser)throw Error('Sign in first.');return dbSDK.deleteDoc(dbSDK.doc(db,'users',auth.currentUser.uid,'people',id));}
export async function connectCalendar(){ready();const p=new authSDK.GoogleAuthProvider();p.addScope('https://www.googleapis.com/auth/calendar.events.readonly');const result=auth.currentUser?await authSDK.reauthenticateWithPopup(auth.currentUser,p):await authSDK.signInWithPopup(auth,p);calendarToken=authSDK.GoogleAuthProvider.credentialFromResult(result)?.accessToken;if(!calendarToken)throw Error('Calendar access was not granted.');return readCalendar();}
export async function readCalendar(){
  if(!calendarToken)throw Error('Connect Google Calendar to read your upcoming events.');const now=new Date();now.setHours(0,0,0,0);const end=new Date(now);end.setDate(now.getDate()+29);
  const params=new URLSearchParams({timeMin:now.toISOString(),timeMax:end.toISOString(),singleEvents:'true',orderBy:'startTime',maxResults:'250'});let items=[],next;
  do{if(next)params.set('pageToken',next);const r=await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?'+params,{headers:{Authorization:'Bearer '+calendarToken},signal:AbortSignal.timeout(12000)});if(!r.ok){if(r.status===401)calendarToken=null;throw Error(r.status===403?'Enable the Calendar API and approve calendar access for this app.':'Calendar access expired or is unavailable; reconnect to refresh.');}const data=await r.json();items.push(...data.items||[]);next=data.nextPageToken;}while(next&&items.length<2000);
  return items.filter(e=>e.status!=='cancelled'&&(e.eventType==='birthday'||/birthday|birth day|cumplea|anniversaire|geburtstag/i.test(e.summary||''))).map(e=>({id:e.id,date:e.start.date||new Date(e.start.dateTime).toLocaleDateString('en-CA'),name:e.summary||'Untitled event',occasion:'Birthday',kind:'Your calendar',source:'Google Calendar · primary calendar'}));
}
