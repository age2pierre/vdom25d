/* tslint:disable:no-class no-console*/
import { Camera, Renderer, Scene } from 'three'

export default class NullRenderer implements Renderer {
  public readonly domElement!: HTMLCanvasElement

  public render(_scene: Scene, _camera: Camera): void {
    console.log('Called mocked method NullRenderer.render()')
  }

  public setSize(
    _width: number,
    _height: number,
    _updateStyle?: boolean | undefined,
  ): void {
    console.log('Called mocked method NullRenderer.setSize()')
  }
}
