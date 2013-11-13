import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import json
import os.path
import logging
import tornado.auth
import traceback
import MySQLdb
import datetime

'''
  Websocket based implementation for sending and receiving messages between creators and approvers
'''
class MainHandler(tornado.web.RequestHandler):
  def get(self):
    self.render('login.html')
    
class WSHandler(tornado.websocket.WebSocketHandler):
  lgr = logging.getLogger('Labor application')
  lgr.setLevel(logging.DEBUG)

  fh = logging.FileHandler('labor_app.log')
  fh.setLevel(logging.WARNING)
  frmt = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
  fh.setFormatter(frmt)
  lgr.addHandler(fh)

  #Global message queue to hold all messages
  db_connect = MySQLdb.connect(host = 'localhost',user = 'db_admin',passwd = 'password',db = 'approvedb')
  message_queue = []
  approvers = set()
  creators = set()
  ceo = set()
  admins = set()
  def open(self):
    self.lgr.info("new connection")
  
  def send_message(self, target_set, json_message):
    try:
      role = self.user_map_roles(json_message['user'])
      c = self.db_connect.cursor()
      reply_message = {}
      reply_message['sendData']= []
      c.execute("Select * from HIRING_EMPLOYEE1 where TIMESTAMP in (SELECT MAX(TIMESTAMP) FROM `HIRING_EMPLOYEE1` GROUP BY EMP_ID)")
      result = c.fetchall()
      for row in result:
        reply_message['sendData'].append(json.loads(row[-3]))            
      c.close()
      reply_message['role'] = role
      for handler in target_set:
        handler.write_message(reply_message, binary=False)
    except AttributeError as e:
      self.lgr.error(e)

  #Called when each message is received. Check if it needs approval. If it does, send the message to the approver.
  def on_message(self, message):
    try:
      json_message = json.loads(message)
      print json.dumps(json_message)
      role = self.user_map_roles(json_message['user'])
      if role == "approver":
        self.lgr.info('Message coming from an approver')
        if self not in self.approvers:
          self.approvers.add(self)
        if 'approvedData' in json_message:
          try:
              c = self.db_connect.cursor()
              user = json_message['user']
              db_data = json.dumps(json_message['approvedData'])
              empid= json_message['approvedData']['project']['project_number']
              c.execute(
                """insert into HIRING_EMPLOYEE1(USER_NAME,DATA, EMP_ID)
                VALUES (%s,%s,%s);""",
                (user,db_data,empid))
              self.db_connect.commit()
              c.close()
              self.send_message(self.approvers,json_message)
              self.send_message(self.creators,json_message)
          except MySQLdb.Error as e:
              self.lgr.error(e) 
        else:
          self.send_message(self.approvers,json_message)
      #If role is that of admin
      elif role == "admin":
        c = self.db_connect.cursor()
        print "In admin"
        self.admins.add(self)
        try:
          if 'data' in json_message:
            user = json_message['user']
            db_data = json.dumps(json_message['data'])
            print db_data
            c.execute(
              """insert into HIRING_BUDGET(USER_NAME,DATA)
              VALUES (%s,%s);""",
              (user,db_data))
            self.db_connect.commit()
            c.close()
            budget_array = json_message['data']
          else:
            c.execute("select * from HIRING_BUDGET order by TIMESTAMP desc limit 1")
            result = c.fetchone()
            c.close()
            if result != None:
              budget_array = json.loads(result[-2])  
            else:
              budget_array = []
          self.id = json_message['user']
          json_message['role'] = role
          objectToBeSent = {}
          objectToBeSent['user'] = json_message['user']
          objectToBeSent['role'] = role
          objectToBeSent['sendData'] = budget_array
          self.write_message(objectToBeSent, binary=False)
        except MySQLdb.Error as e:
          print e 
# If role is that of creator just append the messages to the message 
# queue and add creators to another queue
      elif role == "creator":
        self.id = json_message['user']
        c = self.db_connect.cursor()
        json_message['role'] = role
        self.creators.add(self)
        if 'project' not in json_message:
          self.send_message(self.creators,json_message)
        else:
          try:
            user = json_message['user']
            db_data = json.dumps(json_message)
            print db_data
            empid= json_message['project']['project_number']  
            c.execute(
              """insert into HIRING_EMPLOYEE1(USER_NAME,DATA, EMP_ID)
              VALUES (%s,%s,%s);""",
              (user,db_data,empid))
            self.db_connect.commit()
            self.send_message(self.creators,json_message)
            self.send_message(self.approvers,json_message)
          except MySQLdb.Error as e:
            print e 
    except:
      traceback.print_exc(limit=None, file=None)
      
  def on_close(self):
    print "connection closed"
    if self in self.creators:
      self.creators.remove(self)
      print "creator connection removed"
    if self in self.approvers:
      self.approvers.remove(self)
      print "Approver connection removed"

  def user_map_roles(self,user):
    user_map = {}
    user_map["pradeep"] = "creator"
    user_map["pd"] = "creator"
    user_map['pc'] = 'creator'
    user_map["alex"] = "approver"
    user_map["harsha"] = "approver"
    user_map["vikash"] = "admin"
    user_map["prakriti"] = "admin"
    if user in user_map.keys():
      return user_map[user]

application = tornado.web.Application([
  (r'/websocket', WSHandler),
  (r'/',MainHandler), ], 
  template_path = os.path.join(os.path.dirname(__file__), 'templates'),
  static_path = os.path.join(os.path.dirname(__file__), 'static'),
debug=True)

if __name__ == "__main__":
  http_server = tornado.httpserver.HTTPServer(application)
  http_server.listen(8888)
  tornado.ioloop.IOLoop.instance().start()
