(function(w){
	w.css=function(node,name,val){
		if(!node.transform){
			node.transform ={};
		}
		
		if(arguments.length>2){
			//写
			node.transform[name]=val;
			var reschildt="";
			for(var item in node.transform){
				switch (item){
					case "rotate":
					case "skew":
					case "skewX":
					case "skewY":
						reschildt +=item+"("+node.transform[item]+"deg) ";
						break;
					case "scale":
					case "scaleX":
					case "scaleY":
						reschildt +=item+"("+node.transform[item]+") ";
						break;
					case "translate":
					case "translateX":
					case "translateY":
					case "translateZ":
						reschildt +=item+"("+node.transform[item]+"px) ";
						break;
				}
			}
			node.style.transform=node.style.webkitTransform=reschildt;
		}else{
			//读
			val =node.transform[name];
			if(typeof node.transform[name] == "undefined"){
				//赋默认值
				if(name=="scale"||name=="scaleX"||name=="scaleY"){
					val=1;
				}else{
					val=0;
				}
				
			}
			return val;
		}
		
	}

	//竖向滑屏（快速滑屏   即点即停   带滚动条）
	w.drag=function(wrap,callback){
//		var wrap = document.querySelector("#wrap");
//		var child = document.querySelector("#content");
		var child = wrap.children[0];
		css(child,"translateZ",0.01);
		var startY = 0;
		var elementY = 0;
		var minY = document.documentElement.clientHeight - child.offsetHeight;
		
		//上一次的时间
		var lastTime = 0;
		//上一次的位置
		var lastPoint = 0;
		//时间差
		var timeVal = 1;
		//位置差
		var disVal = 0;
		
		//提供快速滑屏位置数据
		var Tween={
        	Linear:function(t,b,c,d){ return c*t/d + b; },
        	Back:function(t,b,c,d,s){
	            if (s == undefined) s = 1.70158;
	            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        	}
        }
		
		wrap.addEventListener("touchstart",function(ev){
			//即点即停
			clearInterval(wrap.cleartime);
			
			child.style.transition="none";
			
			var touch = ev.changedTouches[0];
			startY=touch.clientY;
			elementY=css(child,"translateY");
			
			lastTime = new Date().getTime();
			lastPoint=elementY;
			
			//时间差
			timeVal = 1;
			//位置差
			disVal = 0;
			
			if(callback&&callback["start"]){
				callback["start"]();
			}
		})
		wrap.addEventListener("touchmove",function(ev){
			var touch = ev.changedTouches[0];
			var nowY = touch.clientY;
			var disY = nowY - startY;
			var translateY = elementY+disY;
			var scale = 0;
			if(translateY>0){
				//1-->0
				scale=document.documentElement.clientHeight/(translateY+document.documentElement.clientHeight*2.5);
				translateY=translateY*scale;
			}else if(translateY<minY){
				var over = minY-translateY;
				scale=document.documentElement.clientHeight/(over+document.documentElement.clientHeight*2.5);
				translateY=minY-over*scale;
			}
			
			//本次的时间
			var nowTime=new Date().getTime();
			//本次的位置
			var nowPoint=translateY;
			
			timeVal = nowTime - lastTime;
			disVal = nowPoint - lastPoint;
			
			lastTime = nowTime;
			lastPoint = nowPoint;
			
//				console.log(disVal+"px : "+timeVal+"ms");
//				console.log(disVal /timeVal);
			
			css(child,"translateY",translateY);
			
			
			if(callback&&callback["move"]){
				callback["move"]();
			}
		})
		
		//处理快速滑屏
		wrap.addEventListener("touchend",function(){
			var speed = disVal /timeVal;
			var traget = css(child,"translateY")+speed*200;
//			var bessel ="";
			var type ="Linear";
			var time = Math.abs(speed)*0.15;
			time =time<0.3?0.3:time;
			
			if(traget>0){
				traget = 0;
				//实现超出回弹
//				bessel="cubic-bezier(.76,1.42,.77,1.4)";
				type ="Back";
			}else if(traget<minY){
				traget=minY;
//				bessel="cubic-bezier(.76,1.42,.77,1.4)";
				type ="Back";
			}
//			child.style.transition=time*5+"s "+bessel;
//			css(child,"translateY",traget);


			//使用Tween来模拟过渡效果
			//闭包：只有函数可以访问它所处的作用域链，就能产生闭包！！
			move(time,traget,type);
		})
		
		
		//使用Tween来模拟过渡效果
		function move(time,traget,type){
			//      t,当前次数(从1开始)
			//      b,初始位置
			//      c,最终位置与初始位置之间的差值
			//      d,总次数
			//      s,回弹距离
			//		返回值:每次运动需要达到的位置
			var s=0;
			var t =0;
			var b= css(child,"translateY");
			var c= traget - b;//如果没有经过touchmove   c的值就是0
			var d= Math.ceil(time/0.02);
			var point=0;
			
			
			clearInterval(wrap.cleartime);
			wrap.cleartime=setInterval(function(){
				t++;
				if(t>d){
					clearInterval(wrap.cleartime);
					if(callback&&callback["end"]){
						callback["end"]();
					}
				}else{
					point = Tween[type](t,b,c,d,s);
					css(child,"translateY",point);
					if(callback&&callback["move"]){
						callback["move"]();
					}
				}
				
			},20)
		}
	}

})(window)
