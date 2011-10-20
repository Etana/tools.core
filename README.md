Use of the library
==================

The library is done so it's simpler to do some script for forumotion forum.

* [move](#f-move)
* [pdelete](#f-pdelete)
* [tdelete](#f-tdelete)
* [tid](#f-tid)
* [trash](#f-trash)

<a name="f-move"></a>
## TC.move(topic_number , forum_number [, success])

### Parameters
* **topic_number :** id of the topic
* **forum_number :** forum where topic must be moved
* **success :** function to execute when topic is moved
### Returns
nothing
### Description
Move the given topic to the given forum

<a name="f-pdelete"></a>
## TC.pdelete(post_number [, success])

### Parameters
* **post_number :** id of the post
* **success :** function to execute when post is deleted
### Returns
nothing
### Description
Delete the gven post

<a name="f-tdelete"></a>
## TC.tdelete(topic_number , forum_number [, success])

##
# Parameters
* **topic_number :** id of the topic
* **forum_number :** forum of the topic
* **success :** function to execute when topic is deleted
### Returns
nothing
### Description
Delete topic with the given number


<a name="f-tid"></a> 
## TC.tid()

### Parameters
none
### Returns
* **string :** tid or "" if unreachable
### Description
Get the tid

<a name="f-trash"></a> 
## TC.trash(topic_number [, success])

### Parameters
* **topic_number :** id of the topic
* **success :** function to execute when topic is trashed
### Returns
nothing
### Description
Move the given topic to the trash
