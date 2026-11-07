"""Integration checks for the local app. Run with the dev server running."""
import urllib.request, urllib.error, json, uuid, pathlib, sqlite3
BASE='http://localhost:5173'
tag='check_'+uuid.uuid4().hex[:10]
password='Test-only-password-12345'
def call(path, body=None, cookie='', origin=BASE):
 headers={'Cookie':cookie}
 if body is not None:headers.update({'Content-Type':'application/json','Origin':origin})
 req=urllib.request.Request(BASE+path,data=json.dumps(body).encode() if body is not None else None,headers=headers)
 try:
  with urllib.request.urlopen(req) as r:
   raw=r.read().decode();return r.status,json.loads(raw) if 'application/json' in r.headers.get('Content-Type','') else raw,r.headers.get('Set-Cookie','').split(';')[0]
 except urllib.error.HTTPError as e:return e.code,e.read().decode(),''
def expect(result,status):
 assert result[0]==status,result
 return result
try:
 expect(call('/login'),200)
 expect(call('/api/reports'),401)
 body={'action':'register','username':tag,'password':password,'remember':True}
 _,_,cookie=expect(call('/api/auth',body),200)
 expect(call('/api/reports?all=1',cookie=cookie),403)
 profile={'name':'Test Resident','age':72,'gender':'Prefer not to say','language':'en','contactType':'email','contact':'test@example.test'}
 expect(call('/api/account',profile,cookie),200)
 stages=[{'game':g,'level':1,'correct':2,'rounds':4} for g in range(4,8)]
 expect(call('/api/calibration',{'stages':stages},cookie),200)
 expect(call('/play',cookie=cookie),200)
 expect(call('/api/sessions',{'id':str(uuid.uuid4()),'game':4,'level':1,'rounds':8,'correct':7,'speed':1800},cookie),200)
 result=expect(call('/api/reports',cookie=cookie),200)
 assert len(result[1]['sessions'])==1
 expect(call('/api/auth',{**body,'username':tag+'_staff','role':'staff','code':'wrong'}),403)
 code=pathlib.Path('.dev.vars').read_text().strip().split('=',1)[1]
 _,_,staff=expect(call('/api/auth',{**body,'username':tag+'_staff','role':'staff','code':code}),200)
 _,people,_=expect(call('/api/reports?all=1',cookie=staff),200)
 resident=next(p['id'] for p in people if p['name']=='Test Resident')
 expect(call('/api/reports?resident='+resident,cookie=staff),200)
 page=expect(call('/staff',cookie=staff),200)[1]
 assert 'Lock staff access' in page and 'My training' not in page
 expect(call('/api/auth',{'action':'logout'},staff),200)
 expect(call('/api/reports?all=1',cookie=staff),401)
 expect(call('/api/auth',{'action':'logout'},cookie),200)
 expect(call('/api/account',cookie=cookie),401)
 _,_,cookie=expect(call('/api/auth',{**body,'action':'login'}),200)
 assert expect(call('/api/reports',cookie=cookie),200)[1]['sessions']
 expect(call('/api/auth',{**body,'action':'login','password':'incorrect-password'}),401)
 expect(call('/api/auth',body,origin='https://other.test'),403)
 print('PASS: local registration, saved login, profiles, assessment, games, reports, staff authorization, locking, logout and persistence.')
finally:
 for file in pathlib.Path('.wrangler/state').rglob('*.sqlite'):
  db=sqlite3.connect(file)
  try:
   ids=[r[0] for r in db.execute('SELECT id FROM local_accounts WHERE username IN (?,?)',(tag,tag+'_staff'))]
   for uid in ids:
    for table,column in [('local_sessions','user_id'),('profiles','id'),('calibrations','user_id'),('sessions','user_id'),('local_accounts','id')]:db.execute('DELETE FROM '+table+' WHERE '+column+'=?',(uid,))
   db.commit()
  except sqlite3.OperationalError:pass
  db.close()
