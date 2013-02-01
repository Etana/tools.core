Use of the library
==================

The library is done so it's simpler to do some script for forumotion forum.

* [FA](#FA)
* [FA.util](#FA.util)
* [FA.util.ver](#FA.util.ver)
* [FA.util.tid](#FA.util.tid)
* [FA.page](#FA.page)
* [FA.page.info](#FA.page.info)
* [FA.page.info.type](#FA.page.info.type)
* [FA.user](#FA.user)
* [FA.user.info](#FA.user.info)
* [FA.user.info.rank](#FA.user.info.rank)
* [FA.user.info.logged](#FA.user.info.logged)
* [FA.user.info.admin](#FA.user.info.admin)
* [FA.user.info.mod](#FA.user.info.mod)
* [FA.pm](#FA.pm)
* [FA.pm.do](#FA.pm.do)
* [FA.pm.do.send](#FA.pm.do.send)
* [FA.post](#FA.post)
* [FA.post.do](#FA.post.do)
* [FA.post.do.remove](#FA.post.do.remove)
* [FA.post.do.get](#FA.post.do.get)
* [FA.topic](#FA.topic)
* [FA.topic.do](#FA.topic.do)
* [FA.topic.do.split](#FA.topic.do.split)
* [FA.topic.do.split\_beyond](#FA.topic.do.split\_beyond)
* [FA.topic.do.remove](#FA.topic.do.remove)
* [FA.topic.do.trash](#FA.topic.do.trash)
* [FA.topic.do.move](#FA.topic.do.move)
* [FA.topic.do.reply](#FA.topic.do.reply)

<a name="FA"></a>
## FA

### Description
The base object

<a name="FA.util"></a>
## FA.util

### Description
Object containing utility method

<a name="FA.util.ver"></a>
## FA.util.ver

### Description
Variable being version of tools core

<a name="FA.util.tid"></a>
## FA.util.tid()

### Description
Method returning tid

#### Parameters
None

#### Returns
String with tid or empty string if not accessible

<a name="FA.page"></a>
## FA.page

### Description
Object about current page

<a name="FA.page.info"></a>
## FA.page.info

### Description
Object about info on current page

<a name="FA.page.info.type"></a>
## FA.page.info.type()

### Description
Method returing type of page

#### Parameters
None

#### Returns
A string indicating the type of page or an empty string

<a name="FA.user"></a>
## FA.user

### Description
Object about user viewing the page

<a name="FA.user.info"></a>
## FA.user.info

### Description
Object about info on user viewing the page

<a name="FA.user.info.rank"></a>
## FA.user.info.rank()

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

<a name="FA.user.info.logged"></a>
## FA.user.info.logged()

### Description
Method testing the logged status of current user

#### Parameters
None

#### Returns
* **true :** if member is logged in
* **false :** if member is logged out

<a name="FA.user.info.admin"></a>
## FA.user.info.admin()

### Description
Method testing if the current user is admin

#### Parameters
None

#### Returns
* **true :** if member is admin
* **false :** if member is not admin

<a name="FA.user.info.mod"></a>
## FA.user.info.mod()

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

<a name="FA.pm.do"></a>
## FA.pm.do

### Description
Object about action for private message

<a name="FA.pm.do.send"></a>
## FA.pm.do.send([username1, ...], subject, message [, success])

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

<a name="FA.post.do"></a>
## FA.post.do

### Description
Object about action on post

<a name="FA.post.do.remove"></a>
## FA.post.do.remove(post\_number [, success])

### Description
Delete the given post

#### Parameters
* **post\_number :** id of the post
* **success :** function to execute when post is deleted

#### Returns
Nothing

<a name="FA.post.do.get"></a>
## FA.post.do.get(post\_number , success)

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

<a name="FA.topic.do"></a>
## FA.topic.do

### Description
Object about action on topics

<a name="FA.topic.do.split"></a>
## FA.topic.do.split(subject, new\_forum, [post1, ...], old\_forum [, success])

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

<a name="FA.topic.do.split_beyond"></a>
## FA.topic.do.split\_beyond(subject, new\_forum, [post1, ...], old\_forum [, success])

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

<a name="FA.topic.do.remove"></a>
## FA.topic.do.remove(topic\_number , forum\_number [, success])

### Description
Delete topic with the given number

#### Parameters
* **topic\_number :** id of the topic
* **forum\_number :** forum of the topic
* **success :** function to execute when topic is deleted

#### Returns
Nothing

<a name="FA.topic.do.trash"></a> 
## FA.topic.do.trash(topic\_number [, success])

### Description
Move the given topic to the trash

#### Parameters
* **topic\_number :** id of the topic
* **success :** function to execute when topic is trashed

#### Returns
Nothing

<a name="FA.topic.do.move"></a>
## FA.topic.do.move(topic\_number, forum\_number [, success])

### Description
Move a given topic to a given forum

#### Parameters
* **topic\_number :** id of the topic
* **forum\_number :** id of the forum
* **success :** function to execute when topic is moved

#### Returns
Nothing

<a name="FA.topic.do.reply"></a>
## FA.topic.do.reply(topic\_number,  message [, success])

### Description
Reply to a given topic with a given message
* **topic\_number :** id of the topic
* **message :** content of the message
* **success :** function to execute when reply is posted

## Returns
Nothing
