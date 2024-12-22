const canvas = document.getElementById("rotatingCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const gravity = 0.6; // Gravitational acceleration
const damping = 0.995; // Damping factor to simulate energy loss

let paused = false; // 애니메이션 멈춤 여부를 제어하는 상태 변수

let speedMultiplier = 1; // 배속 계수

// const COLOR = "rgba(0, 0, 0, 0.3)";
const COLOR = "rgba(255, 255, 255, 0.3)";

const CIRCLE_COLOR_1 = ["#9900ff", "#3cdcb0", "#ffd200", "#ff508c", "#5ad2ff"];

const CIRCLE_COLOR_2 = ["#f95869", "#ffa500", "#4972c1", "#6dbb1f"];

const CIRCLE_COLOR_8 = ["#14aee8", "#fa728f", "#ffa166", "#41bfff", "#5048ff"];

// Pendulum Class
class Pendulum {
  constructor(length, mass, angle, color) {
    this.length = length;
    this.mass = mass;
    this.angle = angle;
    this.angularVelocity = 0.05;
    this.angularAcceleration = 0;
    this.color = color;
  }

  update(parentAngle, parentAngularAcceleration) {
    // Calculate pendulum acceleration
    this.angularAcceleration =
      (-gravity / this.length) * Math.sin(this.angle) +
      parentAngularAcceleration * Math.cos(parentAngle);
    this.angularVelocity += this.angularAcceleration * speedMultiplier; // Adjust by speed multiplier
    this.angularVelocity *= damping;
    this.angle += this.angularVelocity * speedMultiplier; // Adjust by speed multiplier
  }

  getPosition(originX, originY, parentAngle) {
    const x = originX + this.length * Math.sin(this.angle + parentAngle);
    const y = originY + this.length * Math.cos(this.angle + parentAngle);
    return { x, y };
  }
}

// Rod Class
class Rod {
  constructor(centerX, centerY, length, angle) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.length = length;
    this.angle = angle;
    this.angularVelocity = 0;
    this.angularAcceleration = 0;
    this.pendulums = [];
    this.movingPointAngle = 0; // 호를 따라 움직이는 점의 현재 각도
    this.movingPointAngularVelocity = 0.02; // 호를 따라 움직이는 점의 각속도
  }

  addPendulum(pendulum) {
    this.pendulums.push(pendulum);
  }

  update() {
    // Calculate total torque from pendulums
    let netTorque = 0;

    this.pendulums.forEach((pendulum, index) => {
      const torque =
        pendulum.mass * gravity * this.length * Math.sin(pendulum.angle);
      netTorque += index === 0 ? -torque : torque; // Adjust direction for each pendulum
    });

    const momentOfInertia =
      (1 / 12) * this.length ** 2 +
      this.pendulums.reduce(
        (sum, pendulum) => sum + pendulum.mass * pendulum.length ** 2,
        0
      );

    this.angularAcceleration = netTorque / momentOfInertia;
    this.angularVelocity += this.angularAcceleration * speedMultiplier; // Adjust by speed multiplier
    this.angularVelocity *= damping;

    this.angle += this.angularVelocity * speedMultiplier; // Adjust by speed multiplier

    // Update pendulums
    this.pendulums.forEach((pendulum) => {
      pendulum.update(this.angle, this.angularAcceleration);
    });
    this.movingPointAngle += this.movingPointAngularVelocity * speedMultiplier; // Adjust by speed multiplier
  }

  draw() {
    const endX1 = this.centerX - (this.length / 2) * Math.cos(this.angle);
    const endY1 = this.centerY - (this.length / 2) * Math.sin(this.angle);
    const endX2 = this.centerX + (this.length / 2) * Math.cos(this.angle);
    const endY2 = this.centerY + (this.length / 2) * Math.sin(this.angle);

    // Draw the rod
    // ctx.beginPath();
    // ctx.moveTo(endX1, endY1);
    // ctx.lineTo(endX2, endY2);
    // ctx.lineWidth = 5;
    // ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    // ctx.stroke();

    // Draw pendulums
    this.pendulums.forEach((pendulum, index) => {
      const originX = index === 0 ? endX1 : endX2;
      const originY = index === 0 ? endY1 : endY2;

      const { x, y } = pendulum.getPosition(originX, originY, this.angle);

      // Draw the pendulum mass
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = COLOR;
      ctx.fill();

      // Draw the circular path
      // ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
      // ctx.lineWidth = 5;
      // ctx.beginPath();
      // ctx.arc(originX, originY, pendulum.length, 0, Math.PI * 2);
      // ctx.stroke();

      // Add a moving point on the pendulum arc
      const movingPointX =
        originX + pendulum.length * Math.sin(this.movingPointAngle);
      const movingPointY =
        originY + pendulum.length * Math.cos(this.movingPointAngle);

      ctx.strokeStyle =
        pendulum.color === "none" ? "rgba(0, 0, 0, 0, 0.2)" : pendulum.color;
      ctx.lineWidth = 50;
      ctx.beginPath();
      ctx.arc(movingPointX, movingPointY, pendulum.length, 0, Math.PI * 2);
      ctx.stroke();

      // ctx.beginPath();
      // ctx.moveTo(originX, originY);
      // ctx.lineTo(movingPointX, movingPointY);
      // ctx.lineWidth = 5;
      // ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
      // ctx.stroke();
    });
  }
}

// Create independent rods
const mainRod = new Rod(centerX, centerY, 400, Math.PI);
mainRod.addPendulum(new Pendulum(100, 20, Math.PI, CIRCLE_COLOR_2[0]));
mainRod.addPendulum(new Pendulum(200, 10, Math.PI, CIRCLE_COLOR_2[1]));

const secondRod = new Rod(centerX, centerY, 400, Math.PI);
secondRod.addPendulum(new Pendulum(300, 20, Math.PI, CIRCLE_COLOR_2[2]));
secondRod.addPendulum(new Pendulum(200, 20, Math.PI, CIRCLE_COLOR_2[3]));

function animate() {
  if (!paused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    mainRod.update(); // Update main rod
    mainRod.draw(); // Draw main rod and its pendulums

    secondRod.update(); // Update child rod
    secondRod.draw(); // Draw child rod and its pendulums
  }

  requestAnimationFrame(animate);
}

// 키보드 이벤트 리스너 추가
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    paused = !paused; // 스페이스바를 누르면 pause 상태 전환
  } else if (event.code === "ArrowUp") {
    speedMultiplier += 0.1; // Up Arrow increases speed
  } else if (event.code === "ArrowDown") {
    speedMultiplier = Math.max(0.1, speedMultiplier - 0.1); // Down Arrow decreases speed, minimum 0.1
  }
});

animate();
