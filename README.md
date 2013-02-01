Use of the library
==================

The library is done so it's simpler to do some script for forumotion forum.

* [FA](#FA)
* [FA.page](#FA.page)
* [FA.page.type](#FA.page.type)
* [FA.user](#FA.user)
* [FA.user.id](#FA.user.id)
* [FA.user.sid](#FA.user.sid)
* [FA.user.tid](#FA.user.tid)
* [FA.user.aid](#FA.user.aid)
* [FA.user.name](#FA.user.name)
* [FA.user.rank](#FA.user.rank)
* [FA.user.logged](#FA.user.logged)
* [FA.user.admin](#FA.user.admin)
* [FA.user.mod](#FA.user.mod)
* [FA.pm](#FA.pm)
* [FA.pm.send](#FA.pm.send)
* [FA.post](#FA.post)
* [FA.post.remove](#FA.post.remove)
* [FA.post.get](#FA.post.get)
* [FA.topic](#FA.topic)
* [FA.topic.split](#FA.topic.split)
* [FA.topic.split\_beyond](#FA.topic.split\_beyond)
* [FA.topic.remove](#FA.topic.remove)
* [FA.topic.trash](#FA.topic.trash)
* [FA.topic.move](#FA.topic.move)
* [FA.topic.reply](#FA.topic.reply)

<a name="FA"></a>
## FA

### Description
The base object

<a name="FA.page"></a>
## FA.page

### Description
Object about current page

<a name="FA.page.type"></a>
## FA.page.type()

### Description
Method returing type of page

#### Parameters
None

#### Returns
A string indicating the type of page or an empty string, value can be:
* **viewtopic :** topic displaying page
* **viewforum :** forum displaying page
* **index :** index of forum page
* **viewcategory :** category displaying page

<a name="FA.user"></a>
## FA.user

### Description
Object about user viewing the page

<a name="FA.user.id"></a>
## FA.user.id()

### Description
Method returning id of user viewing page

#### Parameters
None

#### Returns
Integer identifying the user ( 0 if user is guest )

<a name="FA.user.sid"></a>
## FA.user.sid()

### Description
Method returning sid of user viewing page

#### Parameters
None

#### Returns
The user sid or an empty string if user is guest

<a name="FA.user.tid"></a>
## FA.user.tid()

### Description
Method returning tid of user viewing page

#### Parameters
None

#### Returns
The tid if available on the page, else an empty string

<a name="FA.user.aid"></a>
## FA.user.id()

### Description
Method returning autologin id of user viewing page

#### Parameters
None

#### Returns
Autologin id if there is one, else an empty string

<a name="FA.user.name"></a>
## FA.user.name()

### Description
Method returning name of user viewing page

#### Parameters
None

#### Returns
The username if available in logout button, else an empty string

<a name="FA.user.rank"></a>
## FA.user.rank()

### Description
Method returning rank of user viewing page

#### Parameters
None

#### Returns
Integer :
* **0 :** viewer is guest
* **1 :** viewer is member
* **2 :** viewer is member which has moderation privilege on current page
* **3 :** viewer is administrator

<a name="FA.user.logged"></a>
## FA.user.logged()

### Description
Method testing the logged status of current user

#### Parameters
None

#### Returns
* **true :** if member is logged in
* **false :** if member is logged out

<a name="FA.user.admin"></a>
## FA.user.admin()

### Description
Method testing if the current user is admin

#### Parameters
None

#### Returns
* **true :** if member is admin
* **false :** if member is not admin

<a name="FA.user.mod"></a>
## FA.user.mod()

### Description
Method testing if the current user can mod current page

#### Parameters
None

#### Returns
* **true :** if member is able to moderate current page
* **false :** if member is not able to moderate current page

<a name="FA.pm"></a>
## FA.pm

### Description
Object about private message

<a name="FA.pm.send"></a>
## FA.pm.send([username1, ...], subject, message [, success])

### Description
Method sending a private message

#### Parameters
* **[username1, ...] :** array of username to which send the private message
* **subject :** title of the private message
* **message :** message content of the private message
* **success :** function to execute when the private message is sended

#### Returns
Nothing

<a name="FA.post"></a>
## FA.post

### Description
Object about post

<a name="FA.post.remove"></a>
## FA.post.remove(post\_number [, success])

### Description
Delete the given post

#### Parameters
* **post\_number :** id of the post
* **success :** function to execute when post is deleted

#### Returns
Nothing

<a name="FA.post.get"></a>
## FA.post.get(post\_number , success)

### Description
Get content of an editable post, content is given as parameter of given function success ( if post not editable, "" is given )

#### Parameters
* **post\_number :** id of the post
* **success :** function to execute when post is got

#### Returns
Nothing

<a name="FA.topic"></a>
## FA.topic

### Description
Object about topic

<a name="FA.topic.split"></a>
## FA.topic.split(subject, new\_forum, [post1, ...], old\_forum [, success])

### Description
Split message from a topic in a new topic

#### Parameters
* **subject :** title of the created topic
* **new\_forum :** id of forum receiving the new topic
* **[post1, ...] :** array of post ids which will be moved to new topic
* **old\_forum :** id of old forum where is the source topic
* **success :** function to execute when topic is splitted

#### Returns
Nothing

<a name="FA.topic.split_beyond"></a>
## FA.topic.split\_beyond(subject, new\_forum, [post1, ...], old\_forum [, success])

### Description
Split message beyond a given post from a topic in a new topic

#### Parameters
* **subject :** title of the created topic
* **new\_forum :** id of forum receiving the new topic
* **[post1, ...] :** array of post ids from which beyond post will be moved to new topic
* **old\_forum :** id of old forum where is the source topic
* **success :** function to execute when topic is splitted

#### Returns
Nothing

<a name="FA.topic.remove"></a>
## FA.topic.remove(topic\_number [, success])

### Description
Delete topic with the given number

#### Parameters
* **topic\_number :** id of the topic
* **success :** function to execute when topic is deleted

#### Returns
Nothing

<a name="FA.topic.trash"></a> 
## FA.topic.trash(topic\_number [, success])

### Description
Move the given topic to the trash

#### Parameters
* **topic\_number :** id of the topic
* **success :** function to execute when topic is trashed

#### Returns
Nothing

<a name="FA.topic.move"></a>
## FA.topic.move(topic\_number, forum\_number [, success])

### Description
Move a given topic to a given forum

#### Parameters
* **topic\_number :** id of the topic
* **forum\_number :** id of the forum
* **success :** function to execute when topic is moved

#### Returns
Nothing

<a name="FA.topic.reply"></a>
## FA.topic.reply(topic\_number,  message [, success])

### Description
Reply to a given topic with a given message
* **topic\_number :** id of the topic
* **message :** content of the message
* **success :** function to execute when reply is posted

## Returns
Nothing
