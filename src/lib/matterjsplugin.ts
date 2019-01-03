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
  world: World
  name: string = 'MatterJSPlugin'
  private _engine: Engine
  private _lastDelta = 1
  private _timeStep = 16.666

  constructor(private _useDeltaForWorldStep: boolean = true) {
    this._engine = Engine.create()
    this.world = this._engine.world
  }

  setGravity(gravity: Vector3): void {
    this.world.gravity = {
      scale: 1,
      x: gravity.x,
      y: gravity.y,
    }
  }

  setTimeStep(timeStep: number): void {
    this._timeStep = timeStep
  }

  getTimeStep(): number {
    return this._timeStep
  }

  executeStep(delta: number, impostors: PhysicsImpostor[]): void {
    if (this._useDeltaForWorldStep) {
      Engine.update(this._engine, delta, delta / this._lastDelta)
      this._lastDelta = delta
    } else {
      Engine.update(this._engine, this._timeStep)
    }
  }

  applyImpulse(
    impostor: PhysicsImpostor,
    force: Vector3,
    contactPoint: Vector3,
  ): void {
    this.applyForce(impostor, force, contactPoint)
  }

  applyForce(
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

  generatePhysicsBody(impostor: PhysicsImpostor): void {
    if (impostor.parent) {
      if (impostor.physicsBody) {
        this.removePhysicsBody(impostor)
        impostor.forceUpdate()
      }
      return
    }
    //should a new body be created for this impostor?
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

  removePhysicsBody(impostor: PhysicsImpostor): void {
    throw new Error('Method not implemented.')
  }

  generateJoint(joint: PhysicsImpostorJoint): void {
    throw new Error('Method not implemented.')
  }

  removeJoint(joint: PhysicsImpostorJoint): void {
    throw new Error('Method not implemented.')
  }

  isSupported(): boolean {
    throw new Error('Method not implemented.')
  }

  setTransformationFromPhysicsBody(impostor: PhysicsImpostor): void {
    throw new Error('Method not implemented.')
  }

  setPhysicsBodyTransformation(
    impostor: PhysicsImpostor,
    newPosition: Vector3,
    newRotation: Quaternion,
  ): void {
    throw new Error('Method not implemented.')
  }

  setLinearVelocity(
    impostor: PhysicsImpostor,
    velocity: Nullable<Vector3>,
  ): void {
    throw new Error('Method not implemented.')
  }

  setAngularVelocity(
    impostor: PhysicsImpostor,
    velocity: Nullable<Vector3>,
  ): void {
    throw new Error('Method not implemented.')
  }

  getLinearVelocity(impostor: PhysicsImpostor): Nullable<Vector3> {
    throw new Error('Method not implemented.')
  }

  getAngularVelocity(impostor: PhysicsImpostor): Nullable<Vector3> {
    throw new Error('Method not implemented.')
  }

  setBodyMass(impostor: PhysicsImpostor, mass: number): void {
    throw new Error('Method not implemented.')
  }

  getBodyMass(impostor: PhysicsImpostor): number {
    throw new Error('Method not implemented.')
  }

  getBodyFriction(impostor: PhysicsImpostor): number {
    throw new Error('Method not implemented.')
  }

  setBodyFriction(impostor: PhysicsImpostor, friction: number): void {
    throw new Error('Method not implemented.')
  }

  getBodyRestitution(impostor: PhysicsImpostor): number {
    throw new Error('Method not implemented.')
  }

  setBodyRestitution(impostor: PhysicsImpostor, restitution: number): void {
    throw new Error('Method not implemented.')
  }

  sleepBody(impostor: PhysicsImpostor): void {
    throw new Error('Method not implemented.')
  }

  wakeUpBody(impostor: PhysicsImpostor): void {
    throw new Error('Method not implemented.')
  }

  updateDistanceJoint(
    joint: PhysicsJoint,
    maxDistance: number,
    minDistance?: number | undefined,
  ): void {
    throw new Error('Method not implemented.')
  }

  setMotor(
    joint: IMotorEnabledJoint,
    speed: number,
    maxForce?: number | undefined,
    motorIndex?: number | undefined,
  ): void {
    throw new Error('Method not implemented.')
  }

  setLimit(
    joint: IMotorEnabledJoint,
    upperLimit: number,
    lowerLimit?: number | undefined,
    motorIndex?: number | undefined,
  ): void {
    throw new Error('Method not implemented.')
  }

  getRadius(impostor: PhysicsImpostor): number {
    throw new Error('Method not implemented.')
  }

  getBoxSizeToRef(impostor: PhysicsImpostor, result: Vector3): void {
    throw new Error('Method not implemented.')
  }

  syncMeshWithImpostor(mesh: AbstractMesh, impostor: PhysicsImpostor): void {
    throw new Error('Method not implemented.')
  }

  dispose(): void {
    throw new Error('Method not implemented.')
  }
}
