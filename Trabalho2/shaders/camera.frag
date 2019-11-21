#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main() {
	vec4 color = texture2D(uSampler, vTextureCoord);
	gl_FragColor = vec4(color.rgb * (0.5-sqrt((vTextureCoord.x-0.25)*(vTextureCoord.x-0.25)+(vTextureCoord.y-0.25)*(vTextureCoord.y-0.25))), 1.0);
}