
using Moq;
using Xunit;

using TaskManagement.Application.Services;
using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Application.Exceptions;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces.IRepository;

using TaskStatus = TaskManagement.Domain.Enums.TaskStatus;

namespace TaskManagement.Tests;

public class TaskServiceTests
{
    private readonly Mock<ITaskRepository> _taskRepository;
    private readonly Mock<IUserRepository> _userRepository;
    private readonly TaskService _service;

    public TaskServiceTests()
    {
        _taskRepository = new Mock<ITaskRepository>();
        _userRepository = new Mock<IUserRepository>();

        _service = new TaskService(
            _taskRepository.Object,
            _userRepository.Object);
    }

    [Fact]
    public async Task CreateTask_ValidData_ReturnsCreatedTask()
    {
        // Arrange
        var dto = new CreateTaskDto
        {
            Title = "  Complete Project  ",
            Description = "  Project description  ",
            Priority = TaskPriority.Medium
        };

        _taskRepository
            .Setup(r => r.AddAsync(It.IsAny<TaskItem>()))
            .Callback<TaskItem>(task => task.Id = 101)
            .Returns(Task.CompletedTask);

        _taskRepository
            .Setup(r => r.GetByIdAsync(101))
            .ReturnsAsync((int id) =>
                new TaskItem
                {
                    Id = 101,
                    Title = "Complete Project",
                    Description = "Project description",
                    CreatedByUserId = 1,
                    CreatedDate = DateTime.UtcNow
                });

        // Act
        var result = await _service.CreateTaskAsync(dto, 1);

        // Assert
        Assert.Equal(101, result.Id);
        Assert.Equal("Complete Project", result.Title);
        Assert.Equal("Project description", result.Description);
        Assert.Equal(TaskStatus.Pending, result.Status);

        _taskRepository.Verify(
            r => r.AddAsync(It.IsAny<TaskItem>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateTask_EmptyTitle_ThrowsArgumentException()
    {
        // Arrange
        var dto = new CreateTaskDto
        {
            Title = " "
        };

        // Act
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _service.CreateTaskAsync(dto, 1));

        // Assert
        Assert.Equal("Task title is required.", exception.Message);
    }

    [Fact]
    public async Task CreateTask_InvalidCreatorId_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var dto = new CreateTaskDto
        {
            Title = "Valid Task"
        };

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _service.CreateTaskAsync(dto, 0));

        _taskRepository.Verify(
            r => r.AddAsync(It.IsAny<TaskItem>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateTask_InactiveEmployee_ThrowsArgumentException()
    {
        // Arrange
        var dto = new CreateTaskDto
        {
            Title = "Valid Task",
            AssignedUserId = 5
        };

        _userRepository
            .Setup(r => r.IsActiveEmployeeAsync(5))
            .ReturnsAsync(false);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => _service.CreateTaskAsync(dto, 1));

        _taskRepository.Verify(
            r => r.AddAsync(It.IsAny<TaskItem>()),
            Times.Never);
    }

    [Fact]
    public async Task GetMyTaskById_OtherUsersTask_ThrowsKeyNotFoundException()
    {
        // Arrange
        var task = new TaskItem
        {
            Id = 10,
            Title = "Private Task",
            AssignedUserId = 5
        };

        _taskRepository
            .Setup(r => r.GetByIdAsync(10))
            .ReturnsAsync(task);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.GetMyTaskByIdAsync(10, 8));
    }

    [Fact]
    public async Task UpdateTaskStatus_OtherUsersTask_ThrowsForbiddenException()
    {
        // Arrange
        var task = new TaskItem
        {
            Id = 10,
            Title = "Assigned Task",
            AssignedUserId = 5
        };

        _taskRepository
            .Setup(r => r.GetByIdAsync(10))
            .ReturnsAsync(task);

        // Act & Assert
        await Assert.ThrowsAsync<ForbiddenException>(
            () => _service.UpdateTaskStatusAsync(
                10, 8, TaskStatus.Completed));

        _taskRepository.Verify(
            r => r.SaveChangesAsync(),
            Times.Never);
    }

    [Fact]
    public async Task DeleteTask_NonExistingTask_ThrowsKeyNotFoundException()
    {
        // Arrange
        _taskRepository
            .Setup(r => r.GetByIdAsync(99))
            .ReturnsAsync((TaskItem?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.DeleteTaskAsync(99));

        _taskRepository.Verify(
            r => r.Delete(It.IsAny<TaskItem>()),
            Times.Never);
    }

    [Fact]
    public async Task GetAllTasks_InvalidPriority_ThrowsArgumentException()
    {
        // Arrange
        var invalidPriority = (TaskPriority)999;

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => _service.GetAllTasksAsync(
                1, 10, null, null, invalidPriority));

        _taskRepository.Verify(
            r => r.GetPagedAsync(
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<string?>(),
                It.IsAny<TaskStatus?>(),
                It.IsAny<TaskPriority?>(),
                It.IsAny<int?>()),
            Times.Never);
    }

[Fact]
public async Task UpdateTask_ExistingTask_UpdatesSuccessfully()
{
    var task = new TaskItem
    {
        Id = 10,
        Title = "Old Title",
        CreatedByUserId = 1
    };

    _taskRepository
        .Setup(r => r.GetByIdAsync(10))
        .ReturnsAsync(task);

    var dto = new UpdateTaskDto
    {
        Title = "Updated Title",
        Description = "Updated description",
        Priority = TaskPriority.High
    };

    await _service.UpdateTaskAsync(10, dto);

    Assert.Equal("Updated Title", task.Title);
    Assert.Equal("Updated description", task.Description);
    Assert.Equal(TaskPriority.High, task.Priority);

    _taskRepository.Verify(r => r.Update(task), Times.Once);
    _taskRepository.Verify(r => r.SaveChangesAsync(), Times.Once);
}

[Fact]
public async Task DeleteTask_ExistingTask_DeletesSuccessfully()
{
    var task = new TaskItem
    {
        Id = 10,
        Title = "Task to delete"
    };

    _taskRepository
        .Setup(r => r.GetByIdAsync(10))
        .ReturnsAsync(task);

    await _service.DeleteTaskAsync(10);

    _taskRepository.Verify(r => r.Delete(task), Times.Once);
    _taskRepository.Verify(r => r.SaveChangesAsync(), Times.Once);
}

[Fact]
public async Task GetMyTaskById_OwnTask_ReturnsTask()
{
    var task = new TaskItem
    {
        Id = 10,
        Title = "My Task",
        AssignedUserId = 5,
        CreatedByUserId = 1
    };

    _taskRepository
        .Setup(r => r.GetByIdAsync(10))
        .ReturnsAsync(task);

   var result = await _service.GetMyTaskByIdAsync(10, 5);

Assert.NotNull(result);
Assert.Equal(10, result.Id);
Assert.Equal("My Task", result.Title);
}

[Fact]
public async Task GetAllTasks_InvalidPageNumber_NormalizesPagination()
{
    _taskRepository
        .Setup(r => r.GetPagedAsync(
            It.IsAny<int>(),
            It.IsAny<int>(),
            It.IsAny<string?>(),
            It.IsAny<TaskStatus?>(),
            It.IsAny<TaskPriority?>(),
            It.IsAny<int?>()))
        .ReturnsAsync((new List<TaskItem>(), 0));

    await _service.GetAllTasksAsync(
        0, 10, null, null, null);

    _taskRepository.Verify(r => r.GetPagedAsync(
        1, 10, null, null, null, null), Times.Once);
}

[Fact]
public async Task UpdateTaskStatus_InvalidStatus_ThrowsArgumentException()
{
    var invalidStatus = (TaskStatus)999;

    await Assert.ThrowsAsync<ArgumentException>(
        () => _service.UpdateTaskStatusAsync(
            10, 5, invalidStatus));

    _taskRepository.Verify(
        r => r.SaveChangesAsync(),
        Times.Never);
}

}
