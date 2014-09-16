var $f = $f || {};
(function() {
  var _param = function(obj, modifier) {
    var buildParams = function(prefix, obj, traditional, add) {
      var name;
      if (jQuery.isArray(obj)) {
        jQuery.each(obj, function(i, v) {
          if (traditional || rbracket.test(prefix)) {
            add(prefix, v);
          } else {
            buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add);
          }
        });
      } else {
        if (!traditional && jQuery.type(obj) === "object") {
          for (name in obj) {
            buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
          }
        } else {
          add(prefix, obj);
        }
      }
    };
    var prefix, s = [], add = function(key, value) {
      if (modifier) {
        if ((value = modifier(key, value)) === undefined) {
          return;
        }
      }
      value = jQuery.isFunction(value) ? value() : value == null ? "" : value;
      s[s.length] = _encodeURIComponent(key) + "=" + _encodeURIComponent(value);
    };
    if (jQuery.isArray(obj) || obj.jquery && !jQuery.isPlainObject(obj)) {
      jQuery.each(obj, function() {
        add(this.name, this.value);
      });
    } else {
      for (prefix in obj) {
        buildParams(prefix, obj[prefix], undefined, add);
      }
    }
    return s.join("&").replace(/%20/g, "+");
  }, _encodeURIComponent = function(str) {
    if ($f.charset != "UTF-8") {
      return encodeURIComponent(escape(str).replace(/%u[A-F0-9]{4}/g, function(x) {
        return "&#" + parseInt(x.substr(2), 16) + ";";
      })).replace(/%25/g, "%");
    } else {
      return encodeURIComponent(str);
    }
  }, _ud = _userdata || {};

  /**
   * $f.page_type - get type of current page
   * 
   * Return: topic, forum, index, category, empty string otherweise 
   */
  $f.page_type = function() {
    var p = location.pathname;
    if (/^\/t[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) {
      return "topic";
    }
    if (/^\/f[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) {
      return "forum";
    }
    if ($("#i_icon_mini_index").parent().attr("href") == p) {
      return "index";
    }
    if (/^\/c[1-9][0-9]*-/.test(p)) {
      return "category";
    }
    return "";
  }();

  /**
   * $f.id - resource id of current page
   * 
   * Return: id of item showed in current page, 0 otherweise
   */
  $f.id = function() {
    var p = location.pathname;
    var m = p.match(/^\/[tfc]([1-9][0-9]*)(p[1-9][0-9]*)?-/);
    if (!m) {
      m = p.match(/^\/u([1-9][0-9]*)[a-z]*$/);
    }
    if (!m) {
      return 0;
    }
    return+m[1];
  }();

  /**
   * $f.page_num - page number of current page
   * 
   * Return: page number or zero
   */
  $f.page_num = function() {
    var p = location.pathname;
    var m = p.match(/^\/[tf][1-9][0-9]*(p[1-9][0-9]*)-/);
    if (!m) {
      return 0;
    }
    return+m[1];
  }();

  /**
   * $f.charset - charset of current page
   *
   * Return: forum charset in uppercase (e.g., UTF-8, WINDOWS-1252, ISO-8859-1)
   */
  $f.charset = (document.charset ? document.charset : document.characterSet).toUpperCase();

  /**
   * $f.user_id - id of user
   *
   * Return: user id, -1 if guest
   */
  $f.user_id = _ud["user_id"];

    /**
     * $f.tid - user temporary identifier
     *
     * Return: tid or empty string
     */
  $f.tid = $("input[name=tid]:first").val() || ($("a[href*='&tid=']:first").attr("href") || "").replace(/^.*&tid=([a-z0-9]*)?.*$/, "$1");

    /**
     * $f.username - user username
     *
     * Return: username or Anonymous if guest
     */
  $f.username = _ud["username"];

    /**
     * $f.is_guest - is user a guest?
     *
     * Return: true if guest, false otherweise
     */
  $f.is_guest = !_ud["session_logged_in"];

    /**
     * $f.is_admin - is user an admin?
     *
     * Return: true if admin, false otherweise
     */
  $f.is_admin = _ud["user_level"] == 1;

    /**
     * $f.is_mod - is user a moderator?
     *
     * Return: true if moderator or admin, false otherweise
     */
  $f.is_mod = _ud["user_level"] > 0;
    
    /**
     * $f.lang - user interface language
     *
     * Return: langage code (fr for french, en for english, ...)
     */
  $f.lang = _ud["lang"];

    /**
     * $f.avatar - user avatar
     *
     * Return: langage code (fr for french, en for english, ...)
     */
  $f.avatar = _ud["avatar"];

    /**
     * $f.num_posts - user number of post
     */
  $f.num_posts = _ud["user_posts"];

    /**
     * $f.num_pms - user number of private message
     */
  $f.num_pms = _ud["user_nb_privmsg"];

  /* $f.num_reps - user number point of reputation */
  $f.num_reps = _ud["point_reputation"];

    /**
     * $f.send_pm - send a private message
     *
     * @username: array with recipients usernames
     * @subject: subject
     * @message: message content
     * @callback: function called with sended form page as parameter
     */
  $f.send_pm = function(usernames, subject, message, callback) {
    $.post("/privmsg", _param({"username":username, subject:subject, message:message, mode:"post", post:1}), e);
  };

    /**
     * $f.get_post_data - get data fields of a message
     * 
     * @post_id: message id
     * @callback: function called with data fields as parameters
     */
  $f.get_post_data = function(post_id, callback) {
    callback && $.get("/post?p=" + post_id + "&mode=editpost", function(p) {
      callback($('form[name="post"]', p).serializeArray());
    });
  };

    /**
     * $f.modify_post - modify a message
     *
     * @post_id: id of message
     * @modifier: function which receive each data field and can modify them for a new value (or undefined to remove field)
     */
  $f.modify_post = function(post_id, modifier) {
    $f.post.get_form(post_id, function(f) {
      $.post("/post", _param(f, modifier) + "&post=1");
    });
  };

    /**
     * $f.delete_post - delete a message
     *
     * @post_id: id of message
     * @callback: function called with sended form page as parameter
     */
  $f.delete_post = function(post_id, callback) {
    $.post("/post", {p:post_id, mode:"delete", confirm:""}, callback);
  };

    /**
     * $f.reply_topic - post a new reply to a topic
     *
     * @topic_id: topic id
     * @message: message content
     * @callback: function called with sended form page as parameter
     */
  $f.reply_topic = function(topic_id, message, callback) {
    $.post("/post", {subject:"", message:message, mode:"reply", t:topic_id, post:1, notify:0}, callback);
  };

    /**
     * $f.split_topic - split a topic
     *
     * @new_title: title of new topic
     * @new_forum_id: forum id of new topic
     * @posts_id: array with post to place in new topic
     * @old_topic_id: id of topic in which messages are currently
     * @callback: function called with sended form page as parameter
     */
  $f.split_topic = function(new_title, new_forum_id, posts_id, old_topic_id, callback) {
    if (typeof p != "object") {
      p = [p];
    }
    $.post("/modcp?tid=" + $f.tid, {subject:new_title, new_forum_id:"f" + new_forum_id, split_type_all:1, post_id_list:posts_id, t:old_topic_id, mode:"split"}, callback);
  };

    /* TODO combine split all and split beyond */
    /**
     * Diviser les messages à la suite d'un message donné dans un nouveau sujet.
     * @param {String} title - titre du nouveau sujet.
     * @param {Number} forum_id - identifiant du forum dans lequel le sujet sera créé.
     * @param {Array} posts_id - tableau avec la liste des identiants de message à partir desquels on découpe.
     * @param {Number} old_topic_id - identifiant du sujet dans lesquels les messages se trouvent.
     * @param {Function} callback - fonction qui sera appelée avec en paramètre la page de résultat de division.
     * @returns {undefinded}
     */
  $f.split_topic_beyond = function(title, forum_id, posts_id, old_topic_id, callback) {
    if (typeof p != "object") {
      p = [p];
    }
    $.post("/modcp?tid=" + $f.tid, {subject:title, new_forum_id:"f" + forum_id, split_type_beyond:1, post_id_list:posts_id, t:old_topic_id, mode:"split"}, callback);
  };

    /**
     * $f.delete_topic - detete a topic
     *
     * @topic_id: id of topic
     * @callback: function called with sended form page as parameter
     */
  $f.delete_topic = function(topic_id, callback) {
    $.post("/modcp?tid=" + $f.tid, {t:topic_id, mode:"delete", confirm:1}, callback);
  };

    /**
     * $f.trash_topic - move a topic to trash
     *
     * @topic_id: id of topic
     * @callback: function called with sended form page as parameter
     */
  $f.trash_topic = function(topic_id, callback) {
    $.get("/modcp?mode=trash&t=" + topic_id + "&tid=" + $f.tid, callback);
  };

  /* TODO combine move and trash */
  /**
   * $f.move_topic - move a topic to another forum
   *
   * @topic_id: id of topic
   * @forum_id: destination forum id
   * @callback: function called with sended form page as parameter
   */
  $f.move_topic = function(topic_id, forum_id, callback) {
    $.post("/modcp?tid=" + $f.tid, {tid:$f.tid, newforum:"f" + forum_id, mode:"move", t:topic_id, confirm:1}, callback);
  };
})();

