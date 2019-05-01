/* tslint:disable:no-class no-console*/
import { Camera, Renderer, Scene } from 'three'

export default class NullRenderer implements Renderer {
  public readonly domElement!: HTMLCanvasElement

  public render(scene: Scene, camera: Camera): void {
    console.log('Called mocked method NullRenderer.render()')
  }

  public setSize(
    width: number,
    height: number,
    updateStyle?: boolean | undefined,
  ): void {
    console.log('Called mocked method NullRenderer.setSize()')
  }
}
