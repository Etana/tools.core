Use of the library
==================

The library is done so it's simpler to do some script for forumotion forum.

* [move](#f-move)
* [pdelete](#f-pdelete)
* [tdelete](#f-tdelete)
* [tid](#f-tid)
* [trash](#f-trash)

	TC.move(topic_number , forum_number [, success])<a name="f-move"></a>

### Parameters
**topic_number :** id of the topic
**forum_number :** forum where topic must be moved
**success :** function to execute when topic is moved
### Returns
nothing
### Description
Move the given topic to the given forum

	TC.pdelete(post_number [, success])<a name="f-pdelete"></a>

### Parameters
**post_number :** id of the post
**success :** function to execute when post is deleted
### Returns
nothing
### Description
Delete the gven post
 
	TC.tdelete(topic_number , forum_number [, success])<a name="f-tdelete"></a>

### Parameters
**topic_number :** id of the topic
**forum_number :** forum of the topic
**success :** function to execute when topic is deleted
### Returns
nothing
### Description
Delete topic with the given number

	TC.tid()<a name="f-tid"></a> 

### Parameters
none
### Returns
**string :** tid or "" if unreachable
### Description
Get the tid

	TC.trash(topic_number [, success])<a name="f-trash"></a> 

### Parameters
**topic_number :** id of the topic
**success :** function to execute when topic is trashed
### Returns
nothing
### Description
Move the given topic to the trash
