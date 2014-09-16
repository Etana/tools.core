var $f = $f || {};

(function(){
    var _param = function(obj, modifier) {
      var buildParams= function(prefix, obj, traditional, add) {
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
      }
      var prefix, s = [], add = function(key, value) {
        if(modifier)
          if((value=modifier(key, value)) === undefined)
            return;

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
    }, _encodeURIComponent= function(str) {
      if($f.charset!='UTF-8')
        return encodeURIComponent(escape(str).replace(/%u[A-F0-9]{4}/g, function(x){ return "&#"+parseInt(x.substr(2),16)+";"; })).replace(/%25/g,'%');
      else
        return encodeURIComponent(str)
    };

    
    /**
     * $f.page_type - get type of current page
     * 
     * Return: 
     *  - "viewtopic" if viewing topic,
     *  - "viewforum" if viewing forum,
     *  - "index" if viewing index,
     *  - "viewcategory" if viewing category,
     *  - empty string "" otherwise
     */

    $f.page_type = (function() {
          var p= location.pathname;
          if(/^\/t[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "viewtopic";
          if(/^\/f[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "viewforum";
          if($("#i_icon_mini_index").parent().attr("href")==p) return "index";
          if(/^\/c[1-9][0-9]*-/.test(p)) return "viewcategory";
          return "";
    })();

    $f.page_id = (function() {
          var p= location.pathname;
          var m = p.match(/^\/[tfc]([1-9][0-9]*)(p[1-9][0-9]*)?-/);
          if(!m) m = p.match(/^\/u([1-9][0-9]*)[a-z]*$/);
          if(!m) return 0;
          return +m[1]
    })();

    $f.page_num = (function() {
          var p= location.pathname;
          var m = p.match(/^\/[tf][1-9][0-9]*(p[1-9][0-9]*)-/);
          if(!m) return 0;
          return +m[1]
    })();

    /**
     * $f.charset - charset of current page
     *
     * Return: forum charset (e.g., UTF-8, windows-1252, ISO-8859-1)
     */
    $f.charset= (document.charset?document.charset:document.characterSet).toUpperCase();

    /**
     * Donnée de la toolbar.
     * @param {String} key - Clé du tableau de donnée de l'utilisateur avec la toolbar activée.<br>
     * Les valeurs possibles sont :
     * <ul><li>session_logged_in : 1 si connecté, 0 sinon</li><li>username : pseudo</li><li>user_id : identifiant</li>
     * <li>user_level : niveau ( 0=invité ou membre, 1=administrateur, 2=modérateur )</li>
     * <li>user_lang : code de langue de l'interface ( exemples : fr=Français, en=Anglais, ... )</li>
     * <li>activate_toolbar : 1 si toolbar activée, 0 sinon</li><li>fix_toolbar : 1 si toolbar fixée, 0 sinon</li>
     * <li>notifications : 1 si notification activée, 0 sinon</li><li>avatar : code html de l'affichage de l'avatar</li>
     * <li>user_posts : nombre de message</li><li>user_nb_privmsg : nombre de message privé</li><li>point_reputation : point de réputation</li></ul>
     * @returns {Number|String|null} Valeur associée à la clé demandée, ou null si elle n'est pas dans le tableau ou si la toolbar est désactivée.
     */
    var _ud = (typeof _userdata !== "undefined") ? _userdata : {};

    /**
     * Identifiant de l'utilisateur.
     * @returns {Number} 0 si l'utilisateur est déconnecté, son identifiant autrement.
     */
    $f.user_id = function(){
      if(_ud["user_id"]!==null)
        return _ud["user_id"]
      return parseInt((my_getcookie('fa_'+location.hostname.replace(/\./g,'_')+'_data')||"0").replace(/.*s:6:"userid";(i:([0-9]+)|s:[0-9]+:"([0-9]+)");.*/,'$2$3'))
    };

    /**
     * sid de l'utilisateur
     * @returns {String} Le sid de l'utilisateur, une chaîne vide si il est déconnecté.
     */
    $f.user_sid = function(){
          return my_getcookie('fa_'+location.hostname.replace(/\./g,'_')+'_sid')||""
    };

    /**
     * tid de l'utilisateur
     * @returns {String} Le tid de l'utilisateur si disponible, une chaîne vide sinon.
     */
    $f.user_tid=  function(){
          return tid=$("input[name=tid]:first").val() ||  ($("a[href*='&tid=']:first").attr("href")||"").replace(/^.*&tid=([a-z0-9]*)?.*$/,"$1");
    };

    /**
     * Nom de l'utilisateur.
     * @returns {String} Le pseudo de l'utilisateur si disponible, une chaîne vide sinon.
     */
    $f.user_name = function(){
      if(_ud["username"]!==null)
        return _ud["username"]
      return ($('#i_icon_mini_logout').attr('title')||"").replace(/^.*? \[ (.*) \]$/,'$1')
    };

    $f.user_is_guest = (_ud["session_logged_in"]!==null ? !_ud["session_logged_in"] : $("#logout").length!=1);

    /**
     * Statut d'administrateur de l'utilisateur.
     * @returns {Number} 1 si administrateur, 0 sinon.
     */
    $f.user_is_admin = (_ud["user_level"]!==null ? _ud["user_level"]==1 : $("a[href='/admin/index.forum?part=admin&tid="+$f.user_tid()+"']").length==1);

    /**
     * Statut de modérateur de l'utilisateur.
     * @returns {Number} 1 si moderateur ou administrateur, 0 sinon.
     */
    $f.user_is_mod = (_ud["user_level"]!==null ? _ud["user_level"] > 0 : $("a[href^='/modcp']:first").length==1);

    /**
     * Envoi d'un message privé.
     * @param {Array} usernames - noms d'utilisateur à qui envoyer le message privé.
     * @param {String} subject - sujet du message privé.
     * @param {String} message - contenu du message privé.
     * @param {Function} callback - fonction appelée une fois le message envoyé avec le contenu de la page de résultat en paramètre.
     * @returns {undefinded}
     */
    $f.send_pm = function(usernames, subject, message, callback){
      $.post("/privmsg",_param({"username":username, subject: subject, message: message, mode: "post",post:1}), e);
    };

    /**
     * Récupérer les champs du formulaire d'édition d'un message.
     * @param {Number} post_id - identifiant du message.
     * @param {Function} callback - fonction qui sera appelée avec en paramètres un objet contenant les champs du formulaire.
     * @returns {undefinded}
     */
    $f.get_post_data = function(post_id, callback) {
      callback && $.get('/post?p='+post_id+'&mode=editpost',function(p){ callback($('form[name="post"]', p).serializeArray()) })
    };

    /**
     * Modifier un message.
     * @param {Number} post_id - identifiant du message.
     * @param {Function} modifier - fonction qui aura en paramètre chaque "nom" et "valeur" de champ, et qui retournera la nouvelle valeur du champ ( ou undefined si le champ doit être supprimé ).
     * @returns {undefinded}
     */
    $f.modify_post = function(post_id, modifier) {
      $f.post.get_form(post_id, function(f) { $.post("/post", _param(f, modifier)+"&post=1"); });
    };

    /**
     * Supprimer un message.
     * @param {Number} post_id - identifiant du message.
     * @param {Function} callback - fonction qui sera appelée avec en paramètre la page de résultat de la suppression.
     * @returns {undefinded}
     */
    $f.delete_post = function(post_id, callback) {
      $.post("/post",{p:post_id, mode:"delete", confirm:""}, callback);
    };

    /**
     * Poster une réponse à un sujet.
     * @param {Number} topic_id - identifiant du sujet.
     * @param {String} message - contenu du message.
     * @param {Function} callback - fonction qui sera appelée avec en paramètre la page de résultat d'envoi.
     * @returns {undefinded}
     */
    $f.reply_topic= function(topic_id, message, callback) {
      $.post("/post",{subject:"",message:message,mode:"reply",t:topic_id,post:1,notify:0},callback);
    };

    /**
     * Diviser des messages dans un nouveau sujet.
     * @param {String} title - titre du nouveau sujet.
     * @param {Number} forum_id - identifiant du forum dans lequel le sujet sera créé.
     * @param {Array} posts_id - tableau avec la liste des identiants de message.
     * @param {Number} old_topic_id - identifiant du sujet dans lesquels les messages se trouvent.
     * @param {Function} callback - fonction qui sera appelée avec en paramètre la page de résultat de division.
     * @returns {undefinded}
     */
    $f.split_topic =  function(new_title, new_forum_id, posts_id, old_topic_id, callback){
      if(typeof p!="object") p=[p];
      $.post("/modcp?tid="+$f.user_tid(),{subject:new_title, new_forum_id:"f"+new_forum_id, split_type_all:1, post_id_list:posts_id, t:old_topic_id, mode:"split"}, callback);
    };

    /**
     * Diviser les messages à la suite d'un message donné dans un nouveau sujet.
     * @param {String} title - titre du nouveau sujet.
     * @param {Number} forum_id - identifiant du forum dans lequel le sujet sera créé.
     * @param {Array} posts_id - tableau avec la liste des identiants de message à partir desquels on découpe.
     * @param {Number} old_topic_id - identifiant du sujet dans lesquels les messages se trouvent.
     * @param {Function} callback - fonction qui sera appelée avec en paramètre la page de résultat de division.
     * @returns {undefinded}
     */
    $f.split_topic_beyond= function(title, forum_id, posts_id, old_topic_id, callback){
      if(typeof p!="object") p=[p];
      $.post("/modcp?tid="+$f.user_tid(),{subject:title,new_forum_id: "f"+forum_id, split_type_beyond:1, post_id_list: posts_id,t: old_topic_id, mode:"split"}, callback);
    };

    $f.delete_topic =  function(t,e) {
      $.post("/modcp?tid="+$f.user_tid(),{ t:t, mode:"delete",confirm:1},e);
    };

    $f.trash_topic = function(t,e) {
      $.get("/modcp?mode=trash&t="+t+"&tid="+$f.user_tid(),e)
    };

    $f.move_topic = function(t,f,e) {
      $.post("/modcp?tid="+$f.user_tid(),{tid:$f.user_tid(),newforum:"f"+f,mode:"move",t:t,confirm:1},e);
    };
    
    
})();
