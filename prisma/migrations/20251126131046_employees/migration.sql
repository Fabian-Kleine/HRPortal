-- CreateTable
CREATE TABLE "EmployeeSettings" (
    "id" TEXT NOT NULL,
    "vacationDays" INTEGER NOT NULL DEFAULT 30,
    "dailyHours" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "hasFlextime" BOOLEAN NOT NULL DEFAULT false,
    "holidayRegion" TEXT NOT NULL DEFAULT 'DE',
    "minBreakTime" INTEGER NOT NULL DEFAULT 30,
    "canWorkRemote" BOOLEAN NOT NULL DEFAULT false,
    "canSelfApprove" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "settingsId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "groupId" TEXT,
    "settingsId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeGroup_name_key" ON "EmployeeGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeGroup_settingsId_key" ON "EmployeeGroup"("settingsId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeNumber_key" ON "Employee"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_settingsId_key" ON "Employee"("settingsId");

-- AddForeignKey
ALTER TABLE "EmployeeGroup" ADD CONSTRAINT "EmployeeGroup_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "EmployeeSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "EmployeeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "EmployeeSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
