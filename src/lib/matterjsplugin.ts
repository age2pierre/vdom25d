import {
  AbstractMesh,
  IMotorEnabledJoint,
  IPhysicsEnginePlugin,
  Nullable,
  PhysicsImpostor,
  PhysicsImpostorJoint,
  PhysicsJoint,
  Quaternion,
  Vector3,
} from 'babylonjs'
import { Bodies, Body, Engine, IBodyDefinition, World } from 'matter-js'

export class MatterJSPlugin implements IPhysicsEnginePlugin {
  public world: World
  public name: string = 'MatterJSPlugin'
  private engine: Engine
  private lastDelta = 1
  private timeStep = 16.666

  constructor(private useDeltaForWorldStep: boolean = true) {
    this.engine = Engine.create()
    this.world = this.engine.world
  }

  public setGravity(gravity: Vector3): void {
    this.world.gravity = {
      scale: 1,
      x: gravity.x,
      y: gravity.y,
    }
  }

  public setTimeStep(timeStep: number): void {
    this.timeStep = timeStep
  }

  public getTimeStep(): number {
    return this.timeStep
  }

  public executeStep(delta: number, impostors: PhysicsImpostor[]): void {
    if (this.useDeltaForWorldStep) {
      Engine.update(this.engine, delta, delta / this.lastDelta)
      this.lastDelta = delta
    } else {
      Engine.update(this.engine, this.timeStep)
    }
  }

  public applyImpulse(
    impostor: PhysicsImpostor,
    force: Vector3,
    contactPoint: Vector3,
  ): void {
    this.applyForce(impostor, force, contactPoint)
  }

  public applyForce(
    impostor: PhysicsImpostor,
    force: Vector3,
    contactPoint: Vector3,
  ): void {
    Body.applyForce(
      impostor.physicsBody as Body,
      {
        x: contactPoint.x,
        y: contactPoint.y,
      },
      {
        x: force.x,
        y: force.y,
      },
    )
  }

  public generatePhysicsBody(impostor: PhysicsImpostor): void {
    if (impostor.parent) {
      if (impostor.physicsBody) {
        this.removePhysicsBody(impostor)
        impostor.forceUpdate()
      }
      return
    }
    // should a new body be created for this impostor?
    if (impostor.isBodyInitRequired()) {
      const object = impostor.object
      const extendedSize = impostor.getObjectExtendSize()
      const oldBody = impostor.physicsBody

      if (oldBody) {
        this.removePhysicsBody(impostor)
      }

      let body: Body
      const options: IBodyDefinition = {
        friction: impostor.getParam('friction'),
        restitution: impostor.getParam('restitution'),
        mass: impostor.getParam('mass'),
      }

      switch (impostor.type) {
        case PhysicsImpostor.SphereImpostor:
        case PhysicsImpostor.CylinderImpostor:
          body = Bodies.circle(1, 2, 3, options)
          break
        case PhysicsImpostor.BoxImpostor:
        case PhysicsImpostor.PlaneImpostor:
          break
        case PhysicsImpostor.MeshImpostor:
          break
        case PhysicsImpostor.HeightmapImpostor:
        case PhysicsImpostor.ParticleImpostor:
        default:
          throw new Error('Impostor type not implemented')
      }
    }
  }

  public removePhysicsBody(impostor: PhysicsImpostor): void {
    throw new Error('Method not implemented.')
  }

  public generateJoint(joint: PhysicsImpostorJoint): void {
    throw new Error('Method not implemented.')
  }

  public removeJoint(joint: PhysicsImpostorJoint): void {
    throw new Error('Method not implemented.')
  }

  public isSupported(): boolean {
    throw new Error('Method not implemented.')
  }

  public setTransformationFromPhysicsBody(impostor: PhysicsImpostor): void {
    throw new Error('Method not implemented.')
  }

  public setPhysicsBodyTransformation(
    impostor: PhysicsImpostor,
    newPosition: Vector3,
    newRotation: Quaternion,
  ): void {
    throw new Error('Method not implemented.')
  }

  public setLinearVelocity(
    impostor: PhysicsImpostor,
    velocity: Nullable<Vector3>,
  ): void {
    throw new Error('Method not implemented.')
  }

  public setAngularVelocity(
    impostor: PhysicsImpostor,
    velocity: Nullable<Vector3>,
  ): void {
    throw new Error('Method not implemented.')
  }

  public getLinearVelocity(impostor: PhysicsImpostor): Nullable<Vector3> {
    throw new Error('Method not implemented.')
  }

  public getAngularVelocity(impostor: PhysicsImpostor): Nullable<Vector3> {
    throw new Error('Method not implemented.')
  }

  public setBodyMass(impostor: PhysicsImpostor, mass: number): void {
    throw new Error('Method not implemented.')
  }

  public getBodyMass(impostor: PhysicsImpostor): number {
    throw new Error('Method not implemented.')
  }

  public getBodyFriction(impostor: PhysicsImpostor): number {
    throw new Error('Method not implemented.')
  }

  public setBodyFriction(impostor: PhysicsImpostor, friction: number): void {
    throw new Error('Method not implemented.')
  }

  public getBodyRestitution(impostor: PhysicsImpostor): number {
    throw new Error('Method not implemented.')
  }

  public setBodyRestitution(
    impostor: PhysicsImpostor,
    restitution: number,
  ): void {
    throw new Error('Method not implemented.')
  }

  public sleepBody(impostor: PhysicsImpostor): void {
    throw new Error('Method not implemented.')
  }

  public wakeUpBody(impostor: PhysicsImpostor): void {
    throw new Error('Method not implemented.')
  }

  public updateDistanceJoint(
    joint: PhysicsJoint,
    maxDistance: number,
    minDistance?: number | undefined,
  ): void {
    throw new Error('Method not implemented.')
  }

  public setMotor(
    joint: IMotorEnabledJoint,
    speed: number,
    maxForce?: number | undefined,
    motorIndex?: number | undefined,
  ): void {
    throw new Error('Method not implemented.')
  }

  public setLimit(
    joint: IMotorEnabledJoint,
    upperLimit: number,
    lowerLimit?: number | undefined,
    motorIndex?: number | undefined,
  ): void {
    throw new Error('Method not implemented.')
  }

  public getRadius(impostor: PhysicsImpostor): number {
    throw new Error('Method not implemented.')
  }

  public getBoxSizeToRef(impostor: PhysicsImpostor, result: Vector3): void {
    throw new Error('Method not implemented.')
  }

  public syncMeshWithImpostor(
    mesh: AbstractMesh,
    impostor: PhysicsImpostor,
  ): void {
    throw new Error('Method not implemented.')
  }

  public dispose(): void {
    throw new Error('Method not implemented.')
  }
}
