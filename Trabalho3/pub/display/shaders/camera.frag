#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float timeFactor;

void main() {
	vec4 color = texture2D(uSampler, vTextureCoord);
	if(mod(vTextureCoord.y*100.0+timeFactor, 2.0) > 1.0)
		color = vec4(color.rgb*2.0,1.0);
	gl_FragColor = vec4(color.rgb * (0.5-sqrt((vTextureCoord.x-0.25)*(vTextureCoord.x-0.25)+(vTextureCoord.y-0.25)*(vTextureCoord.y-0.25))), 1.0);
}